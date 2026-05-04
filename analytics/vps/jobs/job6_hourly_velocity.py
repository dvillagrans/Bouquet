"""
Job 6: Hourly Velocity — On-demand restaurant hourly velocity computation.

Filters orders for a specific restaurant, groups by hour, and writes
the hourly velocity metrics to the gold layer and optionally to Supabase.

Usage:
    spark-submit jobs/job6_hourly_velocity.py \
        --restaurant-id UUID \
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
    SILVER_PATH, GOLD_PATH,
    JDBC_URL, JDBC_PROPS,
    SPARK_DRIVER_MEMORY, SPARK_EXECUTOR_MEMORY, SPARK_SHUFFLE_PARTITIONS,
    LOGS_PATH,
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
        logging.FileHandler(os.path.join(LOGS_PATH, "job6_hourly_velocity.log")),
    ],
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------


def parse_args():
    parser = argparse.ArgumentParser(description="Hourly Velocity — on-demand restaurant velocity")
    parser.add_argument("--restaurant-id", type=str, required=True,
                        help="Target restaurant UUID")
    parser.add_argument("--date", type=str, default=date.today().isoformat(),
                        help="Business date in YYYY-MM-DD format")
    return parser.parse_args()


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    args = parse_args()
    restaurant_id = args.restaurant_id
    business_date = args.date

    silver_dir = os.path.join(SILVER_PATH, business_date)
    gold_dir = os.path.join(GOLD_PATH, business_date)

    logger.info("=" * 60)
    logger.info("Job 6: Hourly Velocity — starting")
    logger.info("  Restaurant: %s", restaurant_id)
    logger.info("  Date: %s", business_date)
    logger.info("  Silver dir: %s", silver_dir)
    logger.info("  Gold dir: %s", gold_dir)
    logger.info("=" * 60)

    from pyspark.sql import SparkSession
    from pyspark.sql import functions as F

    spark = (
        SparkSession.builder
        .appName(f"bouquet-hourly-velocity-{restaurant_id[:8]}")
        .master("local[*]")
        .config("spark.driver.memory", SPARK_DRIVER_MEMORY)
        .config("spark.executor.memory", SPARK_EXECUTOR_MEMORY)
        .config("spark.sql.shuffle.partitions", str(SPARK_SHUFFLE_PARTITIONS))
        .getOrCreate()
    )

    try:
        # -------------------------------------------------------------------
        # Read Silver data
        # -------------------------------------------------------------------
        logger.info("Reading Silver orders_enriched...")
        try:
            orders = spark.read.parquet(f"{silver_dir}/orders_enriched")
        except Exception as e:
            logger.error("Silver orders not found: %s", e)
            spark.stop()
            return

        # -------------------------------------------------------------------
        # Filter for this restaurant
        # -------------------------------------------------------------------
        restaurant_orders = orders.filter(F.col("restaurantId") == restaurant_id)
        order_count = restaurant_orders.count()
        logger.info("  Restaurant orders: %d", order_count)

        if order_count == 0:
            logger.warning("No orders found for restaurant %s on %s", restaurant_id, business_date)
            spark.stop()
            return

        # -------------------------------------------------------------------
        # Group by hour
        # -------------------------------------------------------------------
        hourly_velocity = restaurant_orders \
            .withColumn("hourBin", F.hour("createdAt")) \
            .groupBy("restaurantId", "hourBin") \
            .agg(
                F.sum("totalCents").alias("revenueCents"),
                F.count("id").alias("orderCount")
            ) \
            .withColumn("businessDate", F.lit(business_date)) \
            .withColumn("jobRunId", F.lit("job_6_ondemand")) \
            .withColumn("computedAt", F.current_timestamp())

        # -------------------------------------------------------------------
        # Write to Gold (Parquet)
        # -------------------------------------------------------------------
        output_path = os.path.join(gold_dir, "analytic_restaurant_hourly_velocity")
        os.makedirs(output_path, exist_ok=True)
        hourly_velocity.write.mode("overwrite") \
            .parquet(f"{output_path}/restaurant={restaurant_id}")
        logger.info("  ✓ hourly_velocity — %d records written to gold layer", hourly_velocity.count())

        # -------------------------------------------------------------------
        # Write-back to Supabase (optional best-effort)
        # -------------------------------------------------------------------
        try:
            hourly_velocity.write.mode("append").jdbc(
                url=JDBC_URL,
                table='"analytic_restaurant_hourly_velocity"',
                properties=JDBC_PROPS,
            )
            logger.info("  ✓ hourly_velocity — written to Supabase")
        except Exception as e:
            logger.warning("  ⚠ JDBC write-back skipped: %s", e)

        logger.info("Job 6: Hourly Velocity — completed successfully")

    except Exception as exc:
        logger.exception("Job 6: Hourly Velocity — FAILED: %s", exc)
        raise
    finally:
        spark.stop()


if __name__ == "__main__":
    main()
