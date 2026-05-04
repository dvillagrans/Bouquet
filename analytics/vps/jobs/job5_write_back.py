"""
Job 5: Write-Back — Publish Gold metrics to Supabase PostgreSQL.

Reads the gold layer Parquet files and writes them into corresponding
Supabase analytic tables via JDBC.

Usage:
    spark-submit jobs/job5_write_back.py \
        [--date YYYY-MM-DD]
"""

import sys
import os
import logging
import argparse
from datetime import date

# Add project root to path so config.settings can be imported
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.settings import (
    GOLD_PATH, LOGS_PATH,
    SPARK_DRIVER_MEMORY, SPARK_EXECUTOR_MEMORY, SPARK_SHUFFLE_PARTITIONS,
    JDBC_URL, JDBC_PROPS,
)

# ---------------------------------------------------------------------------
# Logging setup
# ---------------------------------------------------------------------------
os.makedirs(LOGS_PATH, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(os.path.join(LOGS_PATH, "job5_write_back.log")),
    ],
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------

GOLD_TABLES = [
    "analytic_chain_sales_daily",
    "analytic_chain_peak_hours",
    "analytic_chain_top_products",
    "analytic_zone_branch_comparison",
    "analytic_sales_daily",
    "analytic_item_velocity",
    "analytic_service_times",
    "analytic_restaurant_session_depth",
    "forecast",
]


def parse_args():
    parser = argparse.ArgumentParser(description="Write-Back Gold data to Supabase")
    parser.add_argument("--date", type=str, default=date.today().isoformat(),
                        help="Business date in YYYY-MM-DD format")
    return parser.parse_args()


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    args = parse_args()
    business_date = args.date

    gold_dir = os.path.join(GOLD_PATH, business_date)

    logger.info("=" * 60)
    logger.info("Job 5: Write-Back — starting")
    logger.info("  Date: %s", business_date)
    logger.info("  Gold dir: %s", gold_dir)
    logger.info("=" * 60)

    from pyspark.sql import SparkSession

    spark = (
        SparkSession.builder
        .appName("bouquet-write-back")
        .master("local[*]")
        .config("spark.driver.memory", SPARK_DRIVER_MEMORY)
        .config("spark.executor.memory", SPARK_EXECUTOR_MEMORY)
        .config("spark.sql.shuffle.partitions", str(SPARK_SHUFFLE_PARTITIONS))
        .getOrCreate()
    )

    tables_written = 0
    tables_skipped = 0

    try:
        for table_name in GOLD_TABLES:
            parquet_path = os.path.join(gold_dir, table_name)
            try:
                logger.info("Writing %s ...", table_name)
                df = spark.read.parquet(parquet_path)
                count = df.count()

                df.write \
                    .mode("append") \
                    .jdbc(
                        url=JDBC_URL,
                        table=f'"{table_name}"',
                        properties=JDBC_PROPS,
                    )
                logger.info("  ✓ %s — %d records written to Supabase", table_name, count)
                tables_written += 1
            except Exception as e:
                logger.warning("  ✗ Skipping %s: %s", table_name, e)
                tables_skipped += 1

        logger.info("Job 5: Write-Back — completed")
        logger.info("  Tables written: %d", tables_written)
        logger.info("  Tables skipped: %d", tables_skipped)

    except Exception as exc:
        logger.exception("Job 5: Write-Back — FAILED: %s", exc)
        raise
    finally:
        spark.stop()


if __name__ == "__main__":
    main()
