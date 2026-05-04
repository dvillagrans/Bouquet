"""
Bouquet Analytics Orchestrator — FastAPI service for Spark job orchestration.

Endpoints:
  POST /jobs         — Start a Spark analytics pipeline job.
  GET  /jobs/{jobId} — Query job status from the AnalyticsJobRun table.

Background execution runs spark-submit with the appropriate job script and
updates job status in Supabase PostgreSQL via psycopg2.
"""

from __future__ import annotations

import logging
import os
import re
import subprocess
import sys
from datetime import datetime, timezone
from typing import Optional
from uuid import uuid4

# ---------------------------------------------------------------------------
# Path setup — allow importing config/settings from the project root
# ---------------------------------------------------------------------------
_project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, _project_root)

from dotenv import load_dotenv

import psycopg2
import psycopg2.extras
import uvicorn
from fastapi import FastAPI, Header, HTTPException, status
from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Load environment & project settings
# ---------------------------------------------------------------------------
load_dotenv(os.path.join(_project_root, ".env"))

# After load_dotenv we can safely import the settings module (it also calls
# load_dotenv, but that is idempotent with override=False).
# noinspection PyUnresolvedReferences
from config.settings import (  # type: ignore[import-untyped]
    ANALYTICS_API_KEY,
    JDBC_PROPS,
    JDBC_URL,
    LOGS_PATH,
    SPARK_DRIVER_MEMORY,
    SPARK_EXECUTOR_MEMORY,
    SPARK_SHUFFLE_PARTITIONS,
)

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
logger = logging.getLogger("orchestrator")

# ---------------------------------------------------------------------------
# FastAPI application
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Bouquet Analytics Orchestrator",
    description="Orchestrates Spark analytics pipeline jobs for restaurant data.",
    version="0.1.0",
)

# ---------------------------------------------------------------------------
# Job type → script path mapping
# ---------------------------------------------------------------------------
JOB_SCRIPT_MAP: dict[str, str] = {
    "BRONZE": os.path.join(_project_root, "jobs", "job1_extract_bronze.py"),
    "SILVER": os.path.join(_project_root, "jobs", "job2_build_silver.py"),
    "GOLD": os.path.join(_project_root, "jobs", "job3_aggregate_gold.py"),
    "DEMAND_FORECAST": os.path.join(_project_root, "jobs", "job4_demand_estimate.py"),
    "WRITE_BACK": os.path.join(_project_root, "jobs", "job5_write_back.py"),
    "HOURLY_VELOCITY": os.path.join(_project_root, "jobs", "job6_hourly_velocity.py"),
}

VALID_JOB_TYPES = frozenset(JOB_SCRIPT_MAP.keys())

# ---------------------------------------------------------------------------
# JDBC URL parser — extracts psycopg2 connection parameters
# ---------------------------------------------------------------------------
_JDBC_RE = re.compile(
    r"^jdbc:postgresql://(?P<host>[^:/]+)(?::(?P<port>\d+))?/(?P<dbname>.+)$"
)


def _parse_jdbc_url(jdbc_url: str) -> dict[str, str]:
    """Parse a ``jdbc:postgresql://host:port/dbname`` URL into kwargs for psycopg2."""
    m = _JDBC_RE.match(jdbc_url)
    if not m:
        raise ValueError(
            f"Cannot parse JDBC_URL. Expected format "
            f"jdbc:postgresql://host:port/dbname, got: {jdbc_url}"
        )
    return {
        "host": m.group("host"),
        "port": m.group("port") or "5432",
        "dbname": m.group("dbname"),
    }


def _get_connection():
    """Return a new psycopg2 connection to Supabase PostgreSQL."""
    params = _parse_jdbc_url(JDBC_URL)
    params["user"] = JDBC_PROPS.get("user", "")
    params["password"] = JDBC_PROPS.get("password", "")
    return psycopg2.connect(**params)


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------

class JobRequest(BaseModel):
    """Body of a POST /jobs request."""

    jobType: str = Field(
        ...,
        description="Pipeline stage to run.",
        pattern=r"^(BRONZE|SILVER|GOLD|DEMAND_FORECAST|WRITE_BACK|HOURLY_VELOCITY)$",
    )
    restaurantId: str = Field(..., description="Target restaurant identifier.")
    dateFrom: Optional[str] = Field(None, description="Start date (ISO format).")
    dateTo: Optional[str] = Field(None, description="End date (ISO format).")


class JobResponse(BaseModel):
    """Response returned after creating or querying a job."""

    jobId: str
    status: str
    startedAt: Optional[str] = None
    finishedAt: Optional[str] = None
    errorMessage: Optional[str] = None


# ---------------------------------------------------------------------------
# API key validation helper
# ---------------------------------------------------------------------------

def _validate_api_key(x_analytics_key: Optional[str]) -> None:
    if not x_analytics_key or x_analytics_key != ANALYTICS_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing X-Analytics-Key header.",
        )


# ---------------------------------------------------------------------------
# Duplicate check — reject if QUEUED/RUNNING job exists for same pair
# ---------------------------------------------------------------------------

def _find_active_job(restaurant_id: str, job_type: str) -> Optional[str]:
    """Return the job_id of an active (QUEUED or RUNNING) job, or None."""
    query = """
        SELECT id
        FROM "AnalyticsJobRun"
        WHERE "restaurantId" = %s
          AND "jobType" = %s
          AND status IN ('QUEUED', 'RUNNING')
        LIMIT 1
    """
    try:
        conn = _get_connection()
        with conn:
            with conn.cursor() as cur:
                cur.execute(query, (restaurant_id, job_type))
                row = cur.fetchone()
                return row[0] if row else None
    except psycopg2.OperationalError as exc:
        logger.error("Database connection error during duplicate check: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database unavailable.",
        )


# ---------------------------------------------------------------------------
# Background job execution (runs in a subprocess via Popen)
# ---------------------------------------------------------------------------

def _run_background_job(
    job_id: str,
    restaurant_id: str,
    job_type: str,
    date_from: Optional[str],
    date_to: Optional[str],
) -> None:
    """Execute the Spark job in a background subprocess and update status."""
    script_path = JOB_SCRIPT_MAP[job_type]

    # Update status to RUNNING
    _update_job_status(job_id, "RUNNING")

    # Build spark-submit command
    cmd = [
        "spark-submit",
        f"--master=local[*]",
        f"--driver-memory={SPARK_DRIVER_MEMORY}",
        f"--executor-memory={SPARK_EXECUTOR_MEMORY}",
        f"--conf=spark.sql.shuffle.partitions={SPARK_SHUFFLE_PARTITIONS}",
        script_path,
        f"--restaurant_id={restaurant_id}",
    ]
    if date_from:
        cmd.append(f"--date_from={date_from}")
    if date_to:
        cmd.append(f"--date_to={date_to}")

    logger.info(
        "Launching spark-submit for job_id=%s  type=%s  restaurant=%s  cmd=%s",
        job_id,
        job_type,
        restaurant_id,
        " ".join(cmd),
    )

    try:
        proc = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            cwd=_project_root,
        )
        stdout, stderr = proc.communicate()

        if proc.returncode == 0:
            logger.info("Job %s completed successfully.", job_id)
            _update_job_status(job_id, "COMPLETED", stdout=stdout[:2000])
        else:
            error_msg = (stderr or stdout or "Unknown error")[:2000]
            logger.error("Job %s failed with rc=%d: %s", job_id, proc.returncode, error_msg)
            _update_job_status(job_id, "FAILED", error_message=error_msg)
    except FileNotFoundError:
        error_msg = f"spark-submit not found on PATH"
        logger.error("Job %s: %s", job_id, error_msg)
        _update_job_status(job_id, "FAILED", error_message=error_msg)
    except Exception as exc:
        error_msg = f"Unexpected error launching spark-submit: {exc}"
        logger.exception("Job %s: %s", job_id, error_msg)
        _update_job_status(job_id, "FAILED", error_message=error_msg[:2000])


def _update_job_status(
    job_id: str,
    status_value: str,
    error_message: Optional[str] = None,
    stdout: Optional[str] = None,
) -> None:
    """Update the job row in AnalyticsJobRun."""
    now = datetime.now(timezone.utc).isoformat()
    try:
        conn = _get_connection()
        with conn:
            with conn.cursor() as cur:
                if status_value == "RUNNING":
                    cur.execute(
                        """
                        UPDATE "AnalyticsJobRun"
                        SET status = %s, "startedAt" = %s
                        WHERE id = %s
                        """,
                        (status_value, now, job_id),
                    )
                elif status_value in ("SUCCESS", "FAILED"):
                    cur.execute(
                        """
                        UPDATE "AnalyticsJobRun"
                        SET status = %s, "finishedAt" = %s, "errorMessage" = %s
                        WHERE id = %s
                        """,
                        (status_value, now, error_message, job_id),
                    )
                else:
                    cur.execute(
                        """
                        UPDATE "AnalyticsJobRun"
                        SET status = %s
                        WHERE id = %s
                        """,
                        (status_value, job_id),
                    )
        logger.info("Job %s updated to status=%s", job_id, status_value)
    except psycopg2.OperationalError as exc:
        logger.error("Database error updating job %s: %s", job_id, exc)


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@app.post("/jobs", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(
    body: JobRequest,
    x_analytics_key: Optional[str] = Header(None, alias="X-Analytics-Key"),
):
    """Start a new analytics pipeline job.

    Validates the API key, checks for duplicates, inserts a QUEUED row into
    ``AnalyticsJobRun``, and launches ``spark-submit`` in the background.
    """
    # --- Auth ---
    _validate_api_key(x_analytics_key)

    job_type = body.jobType.upper()

    # --- Duplicate check ---
    existing_id = _find_active_job(body.restaurantId, job_type)
    if existing_id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                f"A {job_type} job for restaurant {body.restaurantId} "
                f"is already QUEUED or RUNNING (jobId={existing_id})."
            ),
        )

    # --- Create job ---
    job_id = str(uuid4())
    now = datetime.now(timezone.utc).isoformat()
    try:
        conn = _get_connection()
        with conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO "AnalyticsJobRun"
                        (id, "restaurantId", "jobType", status, "startedAt",
                         "dataWindowStart", "dataWindowEnd")
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    """,
                    (
                        job_id,
                        body.restaurantId,
                        job_type,
                        "QUEUED",
                        now,
                        body.dateFrom,
                        body.dateTo,
                    ),
                )
        logger.info(
            "Job %s created: type=%s restaurant=%s",
            job_id,
            job_type,
            body.restaurantId,
        )
    except psycopg2.OperationalError as exc:
        logger.error("Database error inserting job %s: %s", job_id, exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database unavailable.",
        )

    # --- Launch background execution ---
    # We use threading so the HTTP response returns immediately.
    import threading

    thread = threading.Thread(
        target=_run_background_job,
        args=(job_id, body.restaurantId, job_type, body.dateFrom, body.dateTo),
        daemon=True,
    )
    thread.start()

    return JobResponse(jobId=job_id, status="QUEUED", startedAt=now)


@app.get("/jobs/{job_id}", response_model=JobResponse)
def get_job(job_id: str):
    """Query a job by its UUID and return current status."""
    query = """
        SELECT id, status, "startedAt", "finishedAt", "errorMessage"
        FROM "AnalyticsJobRun"
        WHERE id = %s
    """
    try:
        conn = _get_connection()
        with conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                cur.execute(query, (job_id,))
                row = cur.fetchone()
    except psycopg2.OperationalError as exc:
        logger.error("Database error fetching job %s: %s", job_id, exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database unavailable.",
        )

    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job {job_id} not found.",
        )

    return JobResponse(
        jobId=row["id"],
        status=row["status"],
        startedAt=row["startedAt"],
        finishedAt=row["finishedAt"],
        errorMessage=row["errorMessage"],
    )


# ---------------------------------------------------------------------------
# Health check (useful for monitoring)
# ---------------------------------------------------------------------------

@app.get("/health")
def health():
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
    )
