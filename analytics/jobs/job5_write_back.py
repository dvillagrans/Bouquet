from pyspark.sql import SparkSession
from datetime import date
import sys
import os

def run_job5(business_date: str):
    spark = SparkSession.builder \
        .appName("Job5_WriteBack") \
        .getOrCreate()

    GOLD = f"/data/gold/{business_date}"

    # Para un entorno productivo, estas credenciales deben inyectarse por variables de entorno
    DB_USER = os.getenv("DB_USER", "postgres")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "password")
    DB_HOST = os.getenv("DB_HOST", "db.xyz.supabase.co")
    
    JDBC_URL = f"jdbc:postgresql://{DB_HOST}:5432/postgres"
    JDBC_PROPS = {
        "user": DB_USER,
        "password": DB_PASSWORD,
        "driver": "org.postgresql.Driver"
    }

    gold_tables = [
        "analytic_chain_sales_daily",
        "analytic_chain_peak_hours",
        "analytic_chain_top_products",
        "analytic_zone_branch_comparison",
        "analytic_sales_daily",
        "analytic_item_velocity",
        "analytic_service_times",
        "analytic_restaurant_session_depth",
        "analytic_demand_estimate"
    ]

    for table_name in gold_tables:
        parquet_path = f"{GOLD}/{table_name}"
        try:
            df = spark.read.parquet(parquet_path)
            
            # En un entorno real se harían UPSERTS (ON CONFLICT), pero para Spark puro el mode overwrite 
            # reemplaza la tabla, o mode append inserta nuevos registros. Depende de la estrategia.
            # Asumimos append y control por el dashboard o upsert via JDBC custom dialet si aplica.
            # Por ahora usamos overwrite que recrea la tabla o truncate.
            
            df.write \
              .mode("overwrite") \
              .jdbc(url=JDBC_URL,
                    table=f'"{table_name}"',
                    properties=JDBC_PROPS)
            print(f"[write-back] {table_name}: {df.count()} registros escritos")
        except Exception as e:
            print(f"[write-back] Saltando {table_name}: {e}")

    spark.stop()

if __name__ == "__main__":
    b_date = sys.argv[1] if len(sys.argv) > 1 else str(date.today())
    run_job5(b_date)
