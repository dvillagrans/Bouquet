"""
Job 3: Aggregate Gold — Compute analytics metrics from Silver datasets.

Reads enriched data from the silver layer and computes aggregated metrics:
- Chain-level: sales daily, peak hours, top products
- Zone-level: branch comparison
- Restaurant-level: sales daily, item velocity, service times, session depth

Usage:
    spark-submit jobs/job3_aggregate_gold.py \
        [--date YYYY-MM-DD]
"""

import sys
import os
import logging
import argparse
from datetime import date, datetime

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
        logging.FileHandler(os.path.join(LOGS_PATH, "job3_aggregate_gold.log")),
    ],
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------

def parse_args():
    parser = argparse.ArgumentParser(description="Aggregate Gold metrics from Silver data")
    parser.add_argument("--date", type=str, default=date.today().isoformat(),
                        help="Business date in YYYY-MM-DD format")
    return parser.parse_args()


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    args = parse_args()
    business_date = args.date

    silver_dir = os.path.join(SILVER_PATH, business_date)
    gold_dir = os.path.join(GOLD_PATH, business_date)

    logger.info("=" * 60)
    logger.info("Job 3: Aggregate Gold — starting")
    logger.info("  Date: %s", business_date)
    logger.info("  Silver dir: %s", silver_dir)
    logger.info("  Gold dir: %s", gold_dir)
    logger.info("=" * 60)

    from pyspark.sql import SparkSession
    from pyspark.sql import functions as F
    from pyspark.sql.window import Window

    spark = (
        SparkSession.builder
        .appName("bouquet-aggregate-gold")
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
        try:
            orders   = spark.read.parquet(f"{silver_dir}/orders_enriched")
            items    = spark.read.parquet(f"{silver_dir}/order_items_enriched")
            sessions = spark.read.parquet(f"{silver_dir}/sessions_enriched") if os.path.isdir(f"{silver_dir}/sessions_enriched") else None
            events   = spark.read.parquet(f"{silver_dir}/process_events")
        except Exception as e:
            logger.error("Silver files not found: %s", e)
            return

        job_run_id = "job3_batch_" + business_date

        # ---------------------------------------------------------------
        # LEVEL 1: CHAIN
        # ---------------------------------------------------------------

        # 1. AnalyticChainSalesDaily
        logger.info("Computing AnalyticChainSalesDaily...")
        chain_sales = orders \
            .groupBy("chainId") \
            .agg(F.sum("totalCents").alias("totalRevenueCents")) \
            .withColumn("businessDate", F.lit(business_date)) \
            .withColumn("restaurantRanking", F.lit("[]").cast("string")) \
            .withColumn("revenueDeltaPercent", F.lit(0.0)) \
            .withColumn("jobRunId", F.lit(job_run_id)) \
            .withColumn("computedAt", F.current_timestamp())

        os.makedirs(os.path.join(gold_dir, "analytic_chain_sales_daily"), exist_ok=True)
        chain_sales.write.mode("overwrite").parquet(f"{gold_dir}/analytic_chain_sales_daily")
        logger.info("  ✓ analytic_chain_sales_daily — %d records", chain_sales.count())

        # 2. AnalyticChainPeakHours
        logger.info("Computing AnalyticChainPeakHours...")
        if sessions is not None:
            chain_peak = sessions \
                .withColumn("peakHourBin", F.hour("openedAt")) \
                .groupBy("chainId", "peakHourBin") \
                .agg(F.count("id").alias("sessionCount")) \
                .withColumn("businessDate", F.lit(business_date)) \
                .withColumn("jobRunId", F.lit(job_run_id)) \
                .withColumn("computedAt", F.current_timestamp())

            os.makedirs(os.path.join(gold_dir, "analytic_chain_peak_hours"), exist_ok=True)
            chain_peak.write.mode("overwrite").parquet(f"{gold_dir}/analytic_chain_peak_hours")
            logger.info("  ✓ analytic_chain_peak_hours — %d records", chain_peak.count())
        else:
            logger.warning("  ⚠ Skipping chain peak hours: sessions_enriched not available")

        # 3. AnalyticChainTopProducts
        logger.info("Computing AnalyticChainTopProducts...")
        chain_top = items \
            .groupBy("chainId", "menuItemId") \
            .agg(
                F.sum("quantity").alias("chainTotalQuantity"),
                F.sum("totalCents").alias("itemRevenue")
            ) \
            .withColumn("revenueConcentrationPercent", F.lit(0.0)) \
            .withColumn("businessDate", F.lit(business_date)) \
            .withColumn("jobRunId", F.lit(job_run_id)) \
            .withColumn("computedAt", F.current_timestamp())

        os.makedirs(os.path.join(gold_dir, "analytic_chain_top_products"), exist_ok=True)
        chain_top.write.mode("overwrite").parquet(f"{gold_dir}/analytic_chain_top_products")
        logger.info("  ✓ analytic_chain_top_products — %d records", chain_top.count())

        # ---------------------------------------------------------------
        # LEVEL 2: ZONE
        # ---------------------------------------------------------------

        # AnalyticZoneBranchComparison
        logger.info("Computing AnalyticZoneBranchComparison...")
        zone_comp = orders \
            .groupBy("zoneId") \
            .agg(
                F.avg("totalCents").alias("avgZoneTicketCents"),
                F.stddev("totalCents").alias("ticketStdDev")
            ) \
            .withColumn("branchOutliers", F.lit("[]").cast("string")) \
            .withColumn("menuOverlapPercent", F.lit(100.0)) \
            .withColumn("businessDate", F.lit(business_date)) \
            .withColumn("jobRunId", F.lit(job_run_id)) \
            .withColumn("computedAt", F.current_timestamp())

        os.makedirs(os.path.join(gold_dir, "analytic_zone_branch_comparison"), exist_ok=True)
        zone_comp.write.mode("overwrite").parquet(f"{gold_dir}/analytic_zone_branch_comparison")
        logger.info("  ✓ analytic_zone_branch_comparison — %d records", zone_comp.count())

        # ---------------------------------------------------------------
        # LEVEL 3: RESTAURANT
        # ---------------------------------------------------------------

        # 1. AnalyticSalesDaily
        logger.info("Computing AnalyticSalesDaily...")
        sales_daily = orders \
            .groupBy("restaurantId") \
            .agg(
                F.count("id").alias("orderCount"),
                F.sum("totalCents").alias("grossConsumptionCents")
            ) \
            .withColumn("itemCount", F.lit(0)) \
            .withColumn("discountCents", F.lit(0)) \
            .withColumn("netConsumptionCents", F.col("grossConsumptionCents")) \
            .withColumn("businessDate", F.lit(business_date)) \
            .withColumn("jobRunId", F.lit(job_run_id)) \
            .withColumn("computedAt", F.current_timestamp())

        os.makedirs(os.path.join(gold_dir, "analytic_sales_daily"), exist_ok=True)
        sales_daily.write.mode("overwrite").parquet(f"{gold_dir}/analytic_sales_daily")
        logger.info("  ✓ analytic_sales_daily — %d records", sales_daily.count())

        # 2. AnalyticItemVelocity
        logger.info("Computing AnalyticItemVelocity...")
        item_velocity = items \
            .groupBy("restaurantId", "menuItemId", "itemNameSnapshot") \
            .agg(
                F.sum("quantity").alias("quantitySold"),
                F.sum("totalCents").alias("grossConsumptionCents")
            ) \
            .withColumn("businessDate", F.lit(business_date)) \
            .withColumn("jobRunId", F.lit(job_run_id)) \
            .withColumn("computedAt", F.current_timestamp())

        os.makedirs(os.path.join(gold_dir, "analytic_item_velocity"), exist_ok=True)
        item_velocity.write.mode("overwrite").parquet(f"{gold_dir}/analytic_item_velocity")
        logger.info("  ✓ analytic_item_velocity — %d records", item_velocity.count())

        # 3. AnalyticServiceTimes
        logger.info("Computing AnalyticServiceTimes...")
        SLA_SECONDS = 600
        service_times = events \
            .filter(events.toStatus == "SERVED") \
            .groupBy("restaurantId", "stationId") \
            .agg(
                F.avg("durationSeconds").alias("avgPrepSeconds"),
                F.expr("percentile_approx(durationSeconds, 0.5)").alias("p50PrepSeconds"),
                F.expr("percentile_approx(durationSeconds, 0.9)").alias("p90PrepSeconds"),
                F.sum(F.when(events.durationSeconds > SLA_SECONDS, 1).otherwise(0)).alias("delayedItemsCount")
            ) \
            .withColumn("businessDate", F.lit(business_date)) \
            .withColumn("jobRunId", F.lit(job_run_id)) \
            .withColumn("computedAt", F.current_timestamp())

        os.makedirs(os.path.join(gold_dir, "analytic_service_times"), exist_ok=True)
        service_times.write.mode("overwrite").parquet(f"{gold_dir}/analytic_service_times")
        logger.info("  ✓ analytic_service_times — %d records", service_times.count())

        # 4. AnalyticRestaurantSessionDepth
        logger.info("Computing AnalyticRestaurantSessionDepth...")
        if sessions is not None:
            session_depth = sessions \
                .withColumn("guestTicket", F.col("totalAmount") / F.col("guestCount")) \
                .groupBy("restaurantId") \
                .agg(
                    F.avg("guestTicket").alias("avgGuestTicketCents"),
                    F.max("guestTicket").alias("maxGuestTicketCents")
                ) \
                .withColumn("businessDate", F.lit(business_date)) \
                .withColumn("jobRunId", F.lit(job_run_id)) \
                .withColumn("computedAt", F.current_timestamp())

            os.makedirs(os.path.join(gold_dir, "analytic_restaurant_session_depth"), exist_ok=True)
            session_depth.write.mode("overwrite").parquet(f"{gold_dir}/analytic_restaurant_session_depth")
            logger.info("  ✓ analytic_restaurant_session_depth — %d records", session_depth.count())
        else:
            logger.warning("  ⚠ Skipping session depth: sessions_enriched not available")

        logger.info("Job 3: Aggregate Gold — completed successfully")

    except Exception as exc:
        logger.exception("Job 3: Aggregate Gold — FAILED: %s", exc)
        raise
    finally:
        spark.stop()


if __name__ == "__main__":
    main()
