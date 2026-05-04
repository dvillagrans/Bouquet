"""
Job 2: Build Silver — Clean, join, and enrich bronze data into silver layer.

Reads Parquet from the bronze layer, performs joins and transformations,
and writes enriched datasets to the silver layer.

Usage:
    spark-submit jobs/job2_build_silver.py \
        [--date YYYY-MM-DD]
"""

import sys
import os
import logging
import argparse
from datetime import date

# Add project root to path so config.settings can be imported
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.settings import BRONZE_PATH, SILVER_PATH, LOGS_PATH, SPARK_DRIVER_MEMORY, SPARK_EXECUTOR_MEMORY, SPARK_SHUFFLE_PARTITIONS

# ---------------------------------------------------------------------------
# Logging setup
# ---------------------------------------------------------------------------
os.makedirs(LOGS_PATH, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(os.path.join(LOGS_PATH, "job2_build_silver.log")),
    ],
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def parse_args():
    parser = argparse.ArgumentParser(description="Build Silver layer from Bronze data")
    parser.add_argument("--date", type=str, default=date.today().isoformat(),
                        help="Business date in YYYY-MM-DD format")
    return parser.parse_args()


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    args = parse_args()
    business_date = args.date

    bronze_dir = os.path.join(BRONZE_PATH, business_date)
    silver_dir = os.path.join(SILVER_PATH, business_date)

    logger.info("=" * 60)
    logger.info("Job 2: Build Silver — starting")
    logger.info("  Date: %s", business_date)
    logger.info("  Bronze dir: %s", bronze_dir)
    logger.info("  Silver dir: %s", silver_dir)
    logger.info("=" * 60)

    # -------------------------------------------------------------------
    # SparkSession
    # -------------------------------------------------------------------
    from pyspark.sql import SparkSession
    from pyspark.sql import functions as F

    spark = (
        SparkSession.builder
        .appName("bouquet-build-silver")
        .master("local[*]")
        .config("spark.driver.memory", SPARK_DRIVER_MEMORY)
        .config("spark.executor.memory", SPARK_EXECUTOR_MEMORY)
        .config("spark.sql.shuffle.partitions", str(SPARK_SHUFFLE_PARTITIONS))
        .getOrCreate()
    )

    try:
        # -------------------------------------------------------------------
        # Read Bronze datasets
        # -------------------------------------------------------------------
        logger.info("Reading Bronze datasets...")

        orders      = spark.read.parquet(f"{bronze_dir}/RestaurantOrder")
        items       = spark.read.parquet(f"{bronze_dir}/OrderItem")
        modifiers   = spark.read.parquet(f"{bronze_dir}/OrderItemModifier")
        events      = spark.read.parquet(f"{bronze_dir}/OrderItemStatusEvent")
        payments    = spark.read.parquet(f"{bronze_dir}/Payment")
        menu        = spark.read.parquet(f"{bronze_dir}/RestaurantMenuItem")
        categories  = spark.read.parquet(f"{bronze_dir}/RestaurantCategory")
        restaurants = spark.read.parquet(f"{bronze_dir}/Restaurant")
        chains      = spark.read.parquet(f"{bronze_dir}/Chain")
        stations    = spark.read.parquet(f"{bronze_dir}/Station")
        sessions    = spark.read.parquet(f"{bronze_dir}/DiningSession")

        # -------------------------------------------------------------------
        # Enums to labels
        # -------------------------------------------------------------------
        order_status_map = {
            "OPEN": "Abierta", "SENT": "Enviada",
            "PARTIALLY_READY": "Parcialmente Lista",
            "READY": "Lista", "CLOSED": "Cerrada",
            "CANCELLED": "Cancelada"
        }

        status_udf = F.create_map(
            [F.lit(k) for pair in order_status_map.items() for k in pair]
        )

        # -------------------------------------------------------------------
        # silver_orders_enriched
        # -------------------------------------------------------------------
        logger.info("Building silver_orders_enriched...")
        silver_orders = orders \
            .join(restaurants.select("id", "name", "chainId"),
                  orders.restaurantId == restaurants.id, "left") \
            .join(chains.select("id", "name"),
                  restaurants.chainId == chains.id, "left") \
            .withColumn("restaurantName", restaurants["name"]) \
            .withColumn("chainName", chains["name"]) \
            .withColumn("statusLabel", status_udf[orders.status]) \
            .withColumn("createdDate",
                        F.to_date(F.convert_timezone("UTC",
                                  "America/Mexico_City",
                                  orders.createdAt))) \
            .withColumn("createdHour",
                        F.hour(F.convert_timezone("UTC",
                               "America/Mexico_City",
                               orders.createdAt)))

        os.makedirs(os.path.join(silver_dir, "orders_enriched"), exist_ok=True)
        silver_orders.write.mode("overwrite") \
            .parquet(f"{silver_dir}/orders_enriched")
        logger.info("  ✓ silver_orders_enriched — %d records", silver_orders.count())

        # -------------------------------------------------------------------
        # silver_order_items_enriched
        # -------------------------------------------------------------------
        logger.info("Building silver_order_items_enriched...")
        silver_items = items \
            .join(menu.select("id", "name", "priceCents", "categoryId",
                              "stationId", "restaurantId"),
                  items.menuItemId == menu.id, "left") \
            .join(categories.select("id", "name"),
                  menu.categoryId == categories.id, "left") \
            .join(stations.select("id", "name"),
                  menu.stationId == stations.id, "left") \
            .withColumn("categoryName", categories["name"]) \
            .withColumn("stationName", stations["name"]) \
            .withColumn("unitPriceMXN",
                        F.round(items.unitPriceCents / 100, 2)) \
            .withColumn("totalMXN",
                        F.round(items.totalCents / 100, 2))

        os.makedirs(os.path.join(silver_dir, "order_items_enriched"), exist_ok=True)
        silver_items.write.mode("overwrite") \
            .parquet(f"{silver_dir}/order_items_enriched")
        logger.info("  ✓ silver_order_items_enriched — %d records", silver_items.count())

        # -------------------------------------------------------------------
        # silver_process_events
        # -------------------------------------------------------------------
        logger.info("Building silver_process_events...")
        silver_events = events \
            .join(items.select("id", "menuItemId", "stationId",
                               "itemNameSnapshot"),
                  events.orderItemId == items.id, "left") \
            .join(stations.select("id", "name"),
                  items.stationId == stations.id, "left") \
            .withColumn("stationName", stations["name"])

        os.makedirs(os.path.join(silver_dir, "process_events"), exist_ok=True)
        silver_events.write.mode("overwrite") \
            .parquet(f"{silver_dir}/process_events")
        logger.info("  ✓ silver_process_events — %d records", silver_events.count())

        logger.info("Job 2: Build Silver — completed successfully")

    except Exception as exc:
        logger.exception("Job 2: Build Silver — FAILED: %s", exc)
        raise
    finally:
        spark.stop()


if __name__ == "__main__":
    main()
