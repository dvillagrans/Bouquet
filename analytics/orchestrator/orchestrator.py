from fastapi import FastAPI, BackgroundTasks
from uuid import uuid4
from datetime import datetime
import subprocess
import psycopg2

app = FastAPI()
DB_URL = "<SUPABASE_DIRECT_CONNECTION_URL>"

def get_conn():
    return psycopg2.connect(DB_URL)

def update_job(job_id, status, error=None):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                UPDATE "AnalyticsJobRun"
                SET status = %s,
                    "finishedAt" = %s,
                    "errorMessage" = %s
                WHERE id = %s
            """, (status,
                  datetime.utcnow() if status in ("SUCCESS","FAILED") else None,
                  error, job_id))

def run_pipeline(job_id: str, restaurant_id: str):
    update_job(job_id, "RUNNING")
    jobs = [
        "jobs/job1_extract_bronze.py",
        "jobs/job2_build_silver.py",
        "jobs/job3_aggregate_gold.py",
        "jobs/job4_demand_estimate.py",
        "jobs/job5_write_back.py",
    ]
    for job_path in jobs:
        result = subprocess.run(
            ["spark-submit", "--master", "local[*]", job_path],
            capture_output=True, text=True
        )
        if result.returncode != 0:
            update_job(job_id, "FAILED", result.stderr[-500:])
            return
    update_job(job_id, "SUCCESS")

@app.post("/run-job")
async def run_job(restaurant_id: str,
                  background_tasks: BackgroundTasks):
    job_id = str(uuid4())
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO "AnalyticsJobRun"
                (id, "restaurantId", status, "startedAt")
                VALUES (%s, %s, 'QUEUED', %s)
            """, (job_id, restaurant_id, datetime.utcnow()))
    background_tasks.add_task(run_pipeline, job_id, restaurant_id)
    return {"jobId": job_id}

@app.get("/status/{job_id}")
async def get_status(job_id: str):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT status, "startedAt",
                       "finishedAt", "errorMessage"
                FROM "AnalyticsJobRun" WHERE id = %s
            """, (job_id,))
            row = cur.fetchone()
    if not row:
        return {"error": "Job no encontrado"}
    return {
        "jobId": job_id,
        "status": row[0],
        "startedAt": row[1],
        "finishedAt": row[2],
        "error": row[3]
    }


def run_ondemand_pipeline(job_id: str, restaurant_id: str, business_date: str):
    update_job(job_id, "RUNNING")
    
    # Solo ejecutamos el Job 6
    result = subprocess.run(
        ["spark-submit", "--master", "local[*]", "jobs/job6_hourly_velocity.py", restaurant_id, business_date],
        capture_output=True, text=True
    )
    
    if result.returncode != 0:
        update_job(job_id, "FAILED", result.stderr[-500:])
        return
        
    update_job(job_id, "SUCCESS")

@app.post("/run-job/hourly-velocity")
async def run_hourly_velocity(restaurant_id: str,
                              business_date: str,
                              background_tasks: BackgroundTasks):
    job_id = str(uuid4())
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO "AnalyticsJobRun"
                (id, "restaurantId", "jobType", status, "startedAt", "dataWindowStart")
                VALUES (%s, %s, 'HOURLY_VELOCITY', 'QUEUED', %s, %s)
            """, (job_id, restaurant_id, datetime.utcnow(), business_date))
    background_tasks.add_task(run_ondemand_pipeline, job_id, restaurant_id, business_date)
    return {"jobId": job_id}
