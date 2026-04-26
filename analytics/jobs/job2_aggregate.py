from pyspark.sql import functions as F
from pyspark.sql.window import Window
from datetime import date

SILVER = f"/data/silver/{date.today()}"
GOLD   = f"/data/gold/{date.today()}"

orders = spark.read.parquet(f"{SILVER}/orders_enriched")
items  = spark.read.parquet(f"{SILVER}/order_items_enriched")
events = spark.read.parquet(f"{SILVER}/process_events")

# --- gold_sales_daily ------------------------------------------
sales_daily = items \
    .join(orders.select("id", "restaurantId", "chainId",
                        "restaurantName", "chainName",
                        "createdDate"),
          items.orderId == orders.id, "inner") \
    .groupBy("restaurantId", "restaurantName",
             "chainId", "chainName",
             "categoryName", "createdDate") \
    .agg(
        F.count("id").alias("totalItemsSold"),
        F.countDistinct("orderId").alias("totalOrders"),
        F.sum("totalCents").alias("revenueCents"),
        F.avg("totalCents").alias("avgTicketCents"),
        F.sum(F.when(items.status == "CANCELLED", 1)
              .otherwise(0)).alias("cancellations")
    ) \
    .withColumn("revenueCents", F.col("revenueCents").cast("int")) \
    .withColumn("avgTicketCents", F.col("avgTicketCents").cast("int")) \
    .withColumn("computedAt", F.current_timestamp())

sales_daily.write.mode("overwrite") \
    .parquet(f"{GOLD}/sales_daily")

# --- gold_item_velocity ---------------------------------------
item_velocity = items \
    .filter(items.status != "CANCELLED") \
    .groupBy("menuItemId", "itemNameSnapshot",
             "categoryName", "stationName", "restaurantId") \
    .agg(
        F.sum("quantity").alias("unitsSoldLast30d"),
        F.sum("totalCents").alias("revenueCentsLast30d"),
        F.avg(F.hour("createdAt")).alias("peakHourRaw"),
        F.sum(F.when(items.status == "CANCELLED", 1)
              .otherwise(0)).alias("cancellationCount")
    ) \
    .withColumn("peakHour",
                F.concat(F.col("peakHourRaw").cast("int"),
                         F.lit(":00"))) \
    .withColumn("computedAt", F.current_timestamp())

item_velocity.write.mode("overwrite") \
    .parquet(f"{GOLD}/item_velocity")

# --- gold_process_mining --------------------------------------
w = Window.partitionBy("orderItemId").orderBy("createdAt")

transitions = events \
    .withColumn("prevStatus", lag("toStatus").over(w)) \
    .withColumn("prevTs", lag("createdAt").over(w)) \
    .withColumn("durationSeconds",
                (F.unix_timestamp("createdAt") -
                 F.unix_timestamp("prevTs")).cast("float"))

SLA_SECONDS = 600  # 10 minutos como umbral de referencia

process_mining = transitions \
    .filter(transitions.toStatus == "SERVED") \
    .groupBy("stationName", "restaurantId",
             F.to_date("createdAt").alias("date")) \
    .agg(
        F.avg("durationSeconds").alias("avgSecondsNewToServed"),
        F.sum(F.when(transitions.durationSeconds <= SLA_SECONDS, 1)
              .otherwise(0)).alias("itemsOnTime"),
        F.sum(F.when(transitions.durationSeconds > SLA_SECONDS, 1)
              .otherwise(0)).alias("itemsLate")
    ) \
    .withColumn("slaThresholdSeconds", F.lit(SLA_SECONDS)) \
    .withColumn("bottleneckScore",
                F.col("itemsLate") /
                (F.col("itemsOnTime") + F.col("itemsLate"))) \
    .withColumn("computedAt", F.current_timestamp())

process_mining.write.mode("overwrite") \
    .parquet(f"{GOLD}/process_mining")

spark.stop()
