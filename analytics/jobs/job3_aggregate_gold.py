from pyspark.sql import SparkSession
from pyspark.sql import functions as F
from pyspark.sql.window import Window
from datetime import date
import sys

def run_job3(business_date: str):
    spark = SparkSession.builder \
        .appName("Job3_AggregateGoldMetrics") \
        .getOrCreate()

    SILVER = f"/data/silver/{business_date}"
    GOLD = f"/data/gold/{business_date}"

    # Lectura de datasets Silver
    try:
        orders = spark.read.parquet(f"{SILVER}/orders_enriched")
        items = spark.read.parquet(f"{SILVER}/order_items_enriched")
        sessions = spark.read.parquet(f"{SILVER}/sessions_enriched")
        events = spark.read.parquet(f"{SILVER}/process_events")
        menu = spark.read.parquet(f"{SILVER}/menu_enriched")
    except Exception as e:
        print(f"Archivos Silver no encontrados: {e}")
        return

    job_run_id = "job3_batch_" + business_date

    # --- NIVEL 1: CADENA ---
    
    # 1. AnalyticChainSalesDaily
    chain_sales = orders \
        .groupBy("chainId") \
        .agg(F.sum("totalCents").alias("totalRevenueCents")) \
        .withColumn("businessDate", F.lit(business_date)) \
        .withColumn("restaurantRanking", F.lit("[]").cast("string")) \
        .withColumn("revenueDeltaPercent", F.lit(0.0)) \
        .withColumn("jobRunId", F.lit(job_run_id)) \
        .withColumn("computedAt", F.current_timestamp())

    chain_sales.write.mode("overwrite").parquet(f"{GOLD}/analytic_chain_sales_daily")

    # 2. AnalyticChainPeakHours
    chain_peak = sessions \
        .withColumn("peakHourBin", F.hour("openedAt")) \
        .groupBy("chainId", "peakHourBin") \
        .agg(F.count("id").alias("sessionCount")) \
        .withColumn("businessDate", F.lit(business_date)) \
        .withColumn("jobRunId", F.lit(job_run_id)) \
        .withColumn("computedAt", F.current_timestamp())

    chain_peak.write.mode("overwrite").parquet(f"{GOLD}/analytic_chain_peak_hours")

    # 3. AnalyticChainTopProducts
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

    chain_top.write.mode("overwrite").parquet(f"{GOLD}/analytic_chain_top_products")


    # --- NIVEL 2: ZONA ---

    # 1. AnalyticZoneBranchComparison
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

    zone_comp.write.mode("overwrite").parquet(f"{GOLD}/analytic_zone_branch_comparison")


    # --- NIVEL 3: SUCURSAL ---

    # 1. AnalyticSalesDaily
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

    sales_daily.write.mode("overwrite").parquet(f"{GOLD}/analytic_sales_daily")

    # 2. AnalyticItemVelocity
    item_velocity = items \
        .groupBy("restaurantId", "menuItemId", "itemNameSnapshot") \
        .agg(
            F.sum("quantity").alias("quantitySold"),
            F.sum("totalCents").alias("grossConsumptionCents")
        ) \
        .withColumn("businessDate", F.lit(business_date)) \
        .withColumn("jobRunId", F.lit(job_run_id)) \
        .withColumn("computedAt", F.current_timestamp())

    item_velocity.write.mode("overwrite").parquet(f"{GOLD}/analytic_item_velocity")

    # 3. AnalyticServiceTimes
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

    service_times.write.mode("overwrite").parquet(f"{GOLD}/analytic_service_times")

    # 4. AnalyticRestaurantSessionDepth
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

    session_depth.write.mode("overwrite").parquet(f"{GOLD}/analytic_restaurant_session_depth")

    spark.stop()

if __name__ == "__main__":
    b_date = sys.argv[1] if len(sys.argv) > 1 else str(date.today())
    run_job3(b_date)
