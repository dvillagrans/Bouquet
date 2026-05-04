"""
Job 1: Extract Bronze — PySpark extraction from Supabase PostgreSQL to Parquet.

Reads transactional tables (last 90 days by default), catalog tables (full load),
and the Payment table from Supabase via JDBC, writing the results as Parquet files
in the bronze layer.

Usage:
    spark-submit jobs/job1_extract_bronze.py \
        [--restaurant-id UUID] \
        [--date-from YYYY-MM-DD] \
        [--date-to YYYY-MM-DD]
"""

import sys
import os
import logging
import argparse
from datetime import date, datetime

# Add project root to path so config.settings can be imported
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.settings import *

# ---------------------------------------------------------------------------
# Logging setup
# ---------------------------------------------------------------------------
os.makedirs(LOGS_PATH, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(os.path.join(LOGS_PATH, "job1_extract_bronze.log")),
    ],
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Table definitions
# ---------------------------------------------------------------------------

# Transactional tables: partitioned by createdAt, window-filtered
TRANSACTIONAL_TABLES = [
    "RestaurantOrder",
    "OrderItem",
    "OrderItemModifier",
    "OrderItemStatusEvent",
    "Settlement",
    "SettlementContribution",
    "SettlementAllocation",
    "AppliedAdjustment",
]

# Catalog tables: full load, small
CATALOG_TABLES = [
    "RestaurantMenuItem",
    "ModifierGroup",
    "ModifierOption",
    "RestaurantCategory",
    "Chain",
    "Zone",
    "Restaurant",
    "Station",
    "DiningSession",
    "DiningSessionTable",
    "DiningTable",
    "Guest",
]

# Payment table: partitioned by createdAt, window-filtered
PAYMENT_TABLE = "Payment"

# Column used for date partitioning on transactional/payment tables
DATE_COL = "createdAt"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def parse_args():
    parser = argparse.ArgumentParser(description="Extract bronze layer from Supabase")
    parser.add_argument("--restaurant-id", type=str, default=None,
                        help="Optional restaurant UUID to filter by")
    parser.add_argument("--date-from", type=str, default=None,
                        help="Start date in YYYY-MM-DD format (default: 90 days ago)")
    parser.add_argument("--date-to", type=str, default=None,
                        help="End date in YYYY-MM-DD format (default: today)")
    return parser.parse_args()


def build_where_clause(date_col, date_from, date_to, restaurant_id):
    """Build a SQL WHERE clause for the subquery based on CLI arguments."""
    clauses = []

    if restaurant_id:
        clauses.append(f'"restaurantId" = \'{restaurant_id}\'')

    if date_from and date_to:
        clauses.append(
            f'"{date_col}" >= \'{date_from}\'::timestamp '
            f'AND "{date_col}" < (\'{date_to}\'::date + INTERVAL \'1 day\')'
        )
    elif date_from:
        clauses.append(f'"{date_col}" >= \'{date_from}\'::timestamp')
    elif date_to:
        clauses.append(f'"{date_col}" < (\'{date_to}\'::date + INTERVAL \'1 day\')')
    else:
        # Default: last 90 days using PostgreSQL interval
        clauses.append(f'"{date_col}" >= NOW() - INTERVAL \'90 days\'')

    if clauses:
        return " WHERE " + " AND ".join(clauses)
    return ""


def read_partitioned_table(spark, table_name, date_col, date_from, date_to, restaurant_id):
    """
    Read a transactional table via JDBC with a date-filtered subquery.
    Returns a DataFrame or None if the table is empty / unavailable.
    """
    where = build_where_clause(date_col, date_from, date_to, restaurant_id)
    subquery = f'(SELECT * FROM "{table_name}"{where}) t'

    logger.info("  → Subquery: %s", subquery)
    df = spark.read.jdbc(
        url=JDBC_URL,
        table=subquery,
        properties=JDBC_PROPS,
    )
    return df


def read_catalog_table(spark, table_name):
    """Read a small catalog table in full."""
    df = spark.read.jdbc(
        url=JDBC_URL,
        table=f'"{table_name}"',
        properties=JDBC_PROPS,
    )
    return df


def save_as_parquet(df, output_path, partition_col=None):
    """Write DataFrame to Parquet, optionally partitioning by a column."""
    writer = df.write.mode("overwrite")
    if partition_col and partition_col in df.columns:
        writer = writer.partitionBy(partition_col)
    writer.parquet(output_path)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    args = parse_args()

    # Resolve today's date for the output path
    today_str = date.today().isoformat()
    output_base = os.path.join(BRONZE_PATH, today_str)

    logger.info("=" * 60)
    logger.info("Job 1: Extract Bronze — starting")
    logger.info("  Output base: %s", output_base)
    logger.info("  Restaurant ID filter: %s", args.restaurant_id or "none")
    logger.info("  Date window: %s → %s",
                args.date_from or "90 days ago", args.date_to or "today")
    logger.info("=" * 60)

    # -----------------------------------------------------------------------
    # SparkSession
    # -----------------------------------------------------------------------
    spark = (
        SparkSession.builder
        .appName("bouquet-extract-bronze")
        .master("local[*]")
        .config("spark.driver.memory", SPARK_DRIVER_MEMORY)
        .config("spark.executor.memory", SPARK_EXECUTOR_MEMORY)
        .config("spark.sql.shuffle.partitions", str(SPARK_SHUFFLE_PARTITIONS))
        .getOrCreate()
    )

    logger.info("SparkSession created (driver=%s, executor=%s, shuffle.partitions=%d)",
                SPARK_DRIVER_MEMORY, SPARK_EXECUTOR_MEMORY, SPARK_SHUFFLE_PARTITIONS)

    total_start = datetime.now()
    tables_processed = 0
    tables_failed = 0

    try:
        # -------------------------------------------------------------------
        # 1. Transactional tables (date-partitioned reads)
        # -------------------------------------------------------------------
        logger.info("--- Transactional tables ---")
        for table_name in TRANSACTIONAL_TABLES:
            table_start = datetime.now()
            logger.info("Reading %s ...", table_name)
            try:
                df = read_partitioned_table(
                    spark, table_name, DATE_COL,
                    args.date_from, args.date_to, args.restaurant_id,
                )
                count = df.count()
                table_path = os.path.join(output_base, table_name)
                save_as_parquet(df, table_path, partition_col="restaurantId")
                elapsed = (datetime.now() - table_start).total_seconds()
                logger.info("  ✓ %s — %d records saved to %s (%.1fs)",
                            table_name, count, table_path, elapsed)
                tables_processed += 1
            except Exception as exc:
                elapsed = (datetime.now() - table_start).total_seconds()
                logger.warning("  ✗ %s — FAILED after %.1fs: %s",
                               table_name, elapsed, exc)
                tables_failed += 1

        # -------------------------------------------------------------------
        # 2. Catalog tables (full load)
        # -------------------------------------------------------------------
        logger.info("--- Catalog tables ---")
        for table_name in CATALOG_TABLES:
            table_start = datetime.now()
            logger.info("Reading %s ...", table_name)
            try:
                df = read_catalog_table(spark, table_name)
                count = df.count()
                table_path = os.path.join(output_base, table_name)
                save_as_parquet(df, table_path)
                elapsed = (datetime.now() - table_start).total_seconds()
                logger.info("  ✓ %s — %d records saved to %s (%.1fs)",
                            table_name, count, table_path, elapsed)
                tables_processed += 1
            except Exception as exc:
                elapsed = (datetime.now() - table_start).total_seconds()
                logger.warning("  ✗ %s — FAILED after %.1fs: %s",
                               table_name, elapsed, exc)
                tables_failed += 1

        # -------------------------------------------------------------------
        # 3. Payment table (date-partitioned read)
        # -------------------------------------------------------------------
        logger.info("--- Payment table ---")
        table_start = datetime.now()
        logger.info("Reading %s ...", PAYMENT_TABLE)
        try:
            df = read_partitioned_table(
                spark, PAYMENT_TABLE, DATE_COL,
                args.date_from, args.date_to, args.restaurant_id,
            )
            count = df.count()
            table_path = os.path.join(output_base, PAYMENT_TABLE)
            save_as_parquet(df, table_path, partition_col="restaurantId")
            elapsed = (datetime.now() - table_start).total_seconds()
            logger.info("  ✓ %s — %d records saved to %s (%.1fs)",
                        PAYMENT_TABLE, count, table_path, elapsed)
            tables_processed += 1
        except Exception as exc:
            elapsed = (datetime.now() - table_start).total_seconds()
            logger.warning("  ✗ %s — FAILED after %.1fs: %s",
                           PAYMENT_TABLE, elapsed, exc)
            tables_failed += 1

    finally:
        total_elapsed = (datetime.now() - total_start).total_seconds()
        logger.info("=" * 60)
        logger.info("Job 1: Extract Bronze — finished")
        logger.info("  Tables processed: %d", tables_processed)
        logger.info("  Tables failed:    %d", tables_failed)
        logger.info("  Total time:       %.1f seconds", total_elapsed)
        logger.info("=" * 60)
        spark.stop()


if __name__ == "__main__":
    main()
