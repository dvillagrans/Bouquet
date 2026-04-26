from pyspark.sql import functions as F
from datetime import date

BRONZE = f"/data/bronze/{date.today()}"
SILVER = f"/data/silver/{date.today()}"

# Leer Bronze
orders     = spark.read.parquet(f"{BRONZE}/restaurantorder")
items      = spark.read.parquet(f"{BRONZE}/orderitem")
modifiers  = spark.read.parquet(f"{BRONZE}/orderitemmodifier")
events     = spark.read.parquet(f"{BRONZE}/orderitemstatusevent")
payments   = spark.read.parquet(f"{BRONZE}/payment")
menu       = spark.read.parquet(f"{BRONZE}/restaurantmenuitem")
categories = spark.read.parquet(f"{BRONZE}/restaurantcategory")
restaurants= spark.read.parquet(f"{BRONZE}/restaurant")
chains     = spark.read.parquet(f"{BRONZE}/chain")
stations   = spark.read.parquet(f"{BRONZE}/station")
sessions   = spark.read.parquet(f"{BRONZE}/diningsession")

# Mapeo de enums a etiquetas legibles
order_status_map = {
    "OPEN": "Abierta", "SENT": "Enviada",
    "PARTIALLY_READY": "Parcialmente Lista",
    "READY": "Lista", "CLOSED": "Cerrada",
    "CANCELLED": "Cancelada"
}
item_status_map = {
    "NEW": "Nueva", "SENT": "Enviada",
    "PREPARING": "En preparacion", "READY": "Lista",
    "SERVED": "Servida", "CANCELLED": "Cancelada"
}

status_udf = F.create_map(
    [F.lit(k) for pair in order_status_map.items() for k in pair]
)

# silver_orders_enriched
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

silver_orders.write.mode("overwrite") \
    .parquet(f"{SILVER}/orders_enriched")

# silver_order_items_enriched
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

silver_items.write.mode("overwrite") \
    .parquet(f"{SILVER}/order_items_enriched")

# silver_process_events: timestamps de cada estado por item
silver_events = events \
    .join(items.select("id", "menuItemId", "stationId",
                       "itemNameSnapshot"),
          events.orderItemId == items.id, "left") \
    .join(stations.select("id", "name"),
          items.stationId == stations.id, "left") \
    .withColumn("stationName", stations["name"])

silver_events.write.mode("overwrite") \
    .parquet(f"{SILVER}/process_events")

spark.stop()
