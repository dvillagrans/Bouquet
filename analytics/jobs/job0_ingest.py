from pyspark.sql import SparkSession
from datetime import date

spark = SparkSession.builder \
    .appName("bouquet-ingest") \
    .getOrCreate()

JDBC_URL = "jdbc:postgresql://db.<project>.supabase.co:5432/postgres"
JDBC_PROPS = {
    "user": "postgres",
    "password": "<DB_PASSWORD>",
    "driver": "org.postgresql.Driver"
}

BRONZE_PATH = f"/data/bronze/{date.today()}"

# Lectura particionada por fecha para tablas grandes
def read_partitioned(table, date_col="createdAt"):
    return spark.read.jdbc(
        url=JDBC_URL,
        table=f'(SELECT * FROM "{table}" WHERE "{date_col}" >= NOW() - INTERVAL \'90 days\') t',
        properties=JDBC_PROPS
    )

# Tablas con particion por fecha
for table in ["RestaurantOrder", "OrderItem", "OrderItemModifier",
              "OrderItemStatusEvent", "Payment"]:
    df = read_partitioned(table)
    df.write.mode("overwrite").parquet(f"{BRONZE_PATH}/{table.lower()}")

# Tablas de catalogo (sin particion, son pequenas)
for table in ["RestaurantMenuItem", "RestaurantCategory",
              "Chain", "Zone", "Restaurant", "Station",
              "DiningSession", "DiningTable"]:
    df = spark.read.jdbc(url=JDBC_URL, table=f'"{table}"',
                         properties=JDBC_PROPS)
    df.write.mode("overwrite").parquet(f"{BRONZE_PATH}/{table.lower()}")

spark.stop()
