import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

SUPABASE_JDBC_URL = os.getenv("SUPABASE_JDBC_URL")
SUPABASE_DB_USER = os.getenv("SUPABASE_DB_USER")
SUPABASE_DB_PASSWORD = os.getenv("SUPABASE_DB_PASSWORD")
ANALYTICS_API_KEY = os.getenv("ANALYTICS_API_KEY")
SPARK_DRIVER_MEMORY = os.getenv("SPARK_DRIVER_MEMORY", "2g")
SPARK_EXECUTOR_MEMORY = os.getenv("SPARK_EXECUTOR_MEMORY", "2g")
SPARK_SHUFFLE_PARTITIONS = int(os.getenv("SPARK_SHUFFLE_PARTITIONS", "4"))

BRONZE_PATH = "/app/data/bronze"
SILVER_PATH = "/app/data/silver"
GOLD_PATH = "/app/data/gold"
LOGS_PATH = "/app/logs"

JDBC_URL = os.getenv("SUPABASE_JDBC_URL", "jdbc:postgresql://localhost:5432/postgres")
JDBC_PROPS = {
    "user": os.getenv("SUPABASE_DB_USER", "postgres"),
    "password": os.getenv("SUPABASE_DB_PASSWORD", ""),
    "driver": "org.postgresql.Driver"
}
