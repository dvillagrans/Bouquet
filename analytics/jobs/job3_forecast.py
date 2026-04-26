from pyspark.sql import functions as F
from pyspark.sql.window import Window
from datetime import date, timedelta

SILVER = f"/data/silver/{date.today()}"
GOLD   = f"/data/gold/{date.today()}"

items  = spark.read.parquet(f"{SILVER}/order_items_enriched")
orders = spark.read.parquet(f"{SILVER}/orders_enriched")

# Unir items con fechas de la orden
sales = items \
    .join(orders.select("id", "restaurantId", "chainId",
                        "restaurantName", "createdDate"),
          items.orderId == orders.id, "inner") \
    .filter(items.status != "CANCELLED") \
    .withColumn("dayOfWeek", F.dayofweek("createdDate"))

# Calcular promedio historico por dia de la semana y categoria
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

# Generar proyecciones para los proximos 7 dias
today = date.today()
forecast_rows = []
for delta in range(1, 8):
    forecast_date = today + timedelta(days=delta)
    day_of_week = forecast_date.isoweekday() % 7 + 1  # Spark: 1=Dom
    forecast_rows.append((str(forecast_date), day_of_week))

forecast_dates = spark.createDataFrame(
    forecast_rows, ["forecastDate", "dayOfWeek"]
)

# Cruzar proyecciones con historico
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

forecast.write.mode("overwrite") \
    .parquet(f"{GOLD}/forecast")

spark.stop()
