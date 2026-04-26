from datetime import date

GOLD = f"/data/gold/{date.today()}"

JDBC_URL  = "jdbc:postgresql://db.<project>.supabase.co:5432/postgres"
JDBC_PROPS = {
    "user": "postgres",
    "password": "<DB_PASSWORD>",
    "driver": "org.postgresql.Driver"
}

gold_tables = {
    "analytic_sales_daily":   "sales_daily",
    "analytic_item_velocity": "item_velocity",
    "analytic_process_mining":"process_mining",
    "analytic_forecast":      "forecast",
}

for pg_table, parquet_file in gold_tables.items():
    df = spark.read.parquet(f"{GOLD}/{parquet_file}")
    df.write \
      .mode("overwrite") \
      .jdbc(url=JDBC_URL,
            table=f'"{pg_table}"',
            properties=JDBC_PROPS)
    print(f"[write-back] {pg_table}: {df.count()} registros escritos")

spark.stop()
