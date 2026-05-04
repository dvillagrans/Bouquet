"""
Job 4: Demand Estimate — Forecast demand for the next 7 days.

Uses historical sales data from the silver layer to compute weekly moving
average patterns and project demand for the upcoming week, with confidence scores.

Usage:
    spark-submit jobs/job4_demand_estimate.py \
        [--date YYYY-MM-DD]
"""

import sys
import os
import logging
import argparse
from datetime import date, datetime, timedelta

# Add project root to path so config.settings can be imported
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.settings import SILVER_PATH, GOLD_PATH, LOGS_PATH, SPARK_DRIVER_MEMORY, SPARK_EXECUTOR_MEMORY, SPARK_SHUFFLE_PARTITIONS

# ---------------------------------------------------------------------------
# Logging setup
# ---------------------------------------------------------------------------
os.makedirs(LOGS_PATH, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(os.path.join(LOGS_PATH, "job4_demand_estimate.log")),
    ],
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------

def parse_args():
    parser = argparse.ArgumentParser(description="Demand estimate from Silver data")
    parser.add_argument("--date", type=str, default=date.today().isoformat(),
                        help="Reference date in YYYY-MM-DD format")
    return parser.parse_args()


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    args = parse_args()
    reference_date_str = args.date
    reference_date = date.fromisoformat(reference_date_str)

    silver_dir = os.path.join(SILVER_PATH, reference_date_str)
    gold_dir = os.path.join(GOLD_PATH, reference_date_str)

    logger.info("=" * 60)
    logger.info("Job 4: Demand Estimate — starting")
    logger.info("  Reference date: %s", reference_date_str)
    logger.info("  Silver dir: %s", silver_dir)
    logger.info("  Gold dir: %s", gold_dir)
    logger.info("=" * 60)

    from pyspark.sql import SparkSession
    from pyspark.sql import functions as F
    from pyspark.sql.window import Window

    spark = (
        SparkSession.builder
        .appName("bouquet-demand-estimate")
        .master("local[*]")
        .config("spark.driver.memory", SPARK_DRIVER_MEMORY)
        .config("spark.executor.memory", SPARK_EXECUTOR_MEMORY)
        .config("spark.sql.shuffle.partitions", str(SPARK_SHUFFLE_PARTITIONS))
        .getOrCreate()
    )

    try:
        # -------------------------------------------------------------------
        # Read Silver datasets
        # -------------------------------------------------------------------
        logger.info("Reading Silver datasets...")
        items  = spark.read.parquet(f"{silver_dir}/order_items_enriched")
        orders = spark.read.parquet(f"{silver_dir}/orders_enriched")

        # -------------------------------------------------------------------
        # Join items with order metadata
        # -------------------------------------------------------------------
        logger.info("Joining items with order dates...")
        sales = items \
            .join(orders.select("id", "restaurantId", "chainId",
                                "restaurantName", "createdDate"),
                  items.orderId == orders.id, "inner") \
            .filter(items.status != "CANCELLED") \
            .withColumn("dayOfWeek", F.dayofweek("createdDate"))

        # -------------------------------------------------------------------
        # Historical averages by day of week and category
        # -------------------------------------------------------------------
        logger.info("Computing historical averages...")
        historical_avg = sales \
            .groupBy("restaurantId", "categoryName",
                     "dayOfWeek", "createdDate") \
            .agg(F.sum("quantity").alias("dailyUnits"),
                 F.sum("totalCents").alias("dailyRevenueCents")) \
            .groupBy("restaurantId", "categoryName", "dayOfWeek") \
            .agg(
                F.avg("dailyUnits").alias("avgUnits"),
                F.avg("dailyRevenueCents").alias("avgRevenueCents"),
                F.stddev("dailyUnits").alias("stddevUnits")
            )

        # -------------------------------------------------------------------
        # Generate forecast for the next 7 days
        # -------------------------------------------------------------------
        logger.info("Generating 7-day forecast...")
        forecast_rows = []
        for delta in range(1, 8):
            forecast_date = reference_date + timedelta(days=delta)
            day_of_week = forecast_date.isoweekday() % 7 + 1  # Spark: 1=Sun
            forecast_rows.append((str(forecast_date), day_of_week))

        forecast_dates = spark.createDataFrame(
            forecast_rows, ["forecastDate", "dayOfWeek"]
        )

        # Cross forecast dates with historical patterns
        forecast = historical_avg \
            .join(forecast_dates, "dayOfWeek", "inner") \
            .withColumn("projectedOrders",
                        F.col("avgUnits").cast("int")) \
            .withColumn("projectedRevenueCents",
                        F.col("avgRevenueCents").cast("int")) \
            .withColumn("confidenceScore",
                        F.when(F.col("stddevUnits") == 0, F.lit(1.0))
                         .otherwise(
                            F.greatest(
                                F.lit(0.0),
                                F.least(
                                    F.lit(1.0),
                                    F.lit(1.0) - (F.col("stddevUnits") /
                                                  (F.col("avgUnits") + 1))
                                )
                            )
                         )) \
            .withColumn("modelUsed", F.lit("weighted_moving_avg_weekly")) \
            .withColumn("computedAt", F.current_timestamp()) \
            .select("restaurantId", "categoryName", "forecastDate",
                    "projectedOrders", "projectedRevenueCents",
                    "confidenceScore", "modelUsed", "computedAt")

        # -------------------------------------------------------------------
        # Write to Gold
        # -------------------------------------------------------------------
        os.makedirs(os.path.join(gold_dir, "forecast"), exist_ok=True)
        forecast.write.mode("overwrite") \
            .parquet(f"{gold_dir}/forecast")
        logger.info("  ✓ forecast — %d records written to gold layer", forecast.count())

        logger.info("Job 4: Demand Estimate — completed successfully")

    except Exception as exc:
        logger.exception("Job 4: Demand Estimate — FAILED: %s", exc)
        raise
    finally:
        spark.stop()


if __name__ == "__main__":
    main()
