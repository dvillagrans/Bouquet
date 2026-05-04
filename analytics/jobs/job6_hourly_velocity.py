from pyspark.sql import SparkSession
from pyspark.sql import functions as F
from datetime import date
import sys

def run_hourly_velocity(restaurant_id: str, business_date: str):
    """
    Job 6 - Restaurant Hourly Velocity (On-demand)
    """
    spark = SparkSession.builder \
        .appName(f"Job6_HourlyVelocity_{restaurant_id}") \
        .config("spark.driver.memory", "2g") \
        .config("spark.executor.memory", "2g") \
        .config("spark.sql.shuffle.partitions", "4") \
        .getOrCreate()

    # Leemos la capa Silver o transaccional reciente (en un caso real, puede inyectarse via JDBC directamente o micro-batches)
    SILVER = f"/data/silver/{business_date}"
    GOLD = f"/data/gold/{business_date}"
    
    try:
        orders = spark.read.parquet(f"{SILVER}/orders_enriched")
    except Exception as e:
        print(f"Error al leer datos base: {e}")
    

    # --- Write-Back inmediato para on-demand ---
    import os
    DB_USER = os.getenv("DB_USER", "postgres")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "password")
    DB_HOST = os.getenv("DB_HOST", "db.xyz.supabase.co")
    
    JDBC_URL = f"jdbc:postgresql://{DB_HOST}:5432/postgres"
    JDBC_PROPS = {
        "user": DB_USER,
        "password": DB_PASSWORD,
        "driver": "org.postgresql.Driver"
    }

    try:
        # En la práctica real, deberíamos usar una operación UPSERT. 
        # Aquí usamos append asumiendo que el pipeline elimina/upserta manualmente o se limpia antes.
        hourly_velocity.write.mode("append").jdbc(
            url=JDBC_URL,
            table='"analytic_restaurant_hourly_velocity"',
            properties=JDBC_PROPS
        )
        print(f"[job6] Restaurant {restaurant_id}: {hourly_velocity.count()} registros actualizados on-demand")
    except Exception as e:
        print(f"Error en escritura JDBC on-demand: {e}")

    spark.stop()
        return
        
    # Filtramos para la sucursal actual
    restaurant_orders = orders.filter(F.col("restaurantId") == restaurant_id)
    
    # Agrupamos por hora usando la fecha de creación
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

    hourly_velocity.write.mode("overwrite") \
        .parquet(f"{GOLD}/analytic_restaurant_hourly_velocity/restaurant={restaurant_id}")



    # --- Write-Back inmediato para on-demand ---
    import os
    DB_USER = os.getenv("DB_USER", "postgres")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "password")
    DB_HOST = os.getenv("DB_HOST", "db.xyz.supabase.co")
    
    JDBC_URL = f"jdbc:postgresql://{DB_HOST}:5432/postgres"
    JDBC_PROPS = {
        "user": DB_USER,
        "password": DB_PASSWORD,
        "driver": "org.postgresql.Driver"
    }

    try:
        # En la práctica real, deberíamos usar una operación UPSERT. 
        # Aquí usamos append asumiendo que el pipeline elimina/upserta manualmente o se limpia antes.
        hourly_velocity.write.mode("append").jdbc(
            url=JDBC_URL,
            table='"analytic_restaurant_hourly_velocity"',
            properties=JDBC_PROPS
        )
        print(f"[job6] Restaurant {restaurant_id}: {hourly_velocity.count()} registros actualizados on-demand")
    except Exception as e:
        print(f"Error en escritura JDBC on-demand: {e}")

    spark.stop()

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Uso: spark-submit job6_hourly_velocity.py <restaurant_id> <business_date>")
        sys.exit(1)
        
    rest_id = sys.argv[1]
    b_date = sys.argv[2]
    run_hourly_velocity(rest_id, b_date)
