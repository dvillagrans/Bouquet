from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
import os
from dotenv import load_dotenv

load_dotenv()

print("Loading database configuration...")  # Debug

# Database URL - Force async SQLite
DATABASE_URL = "sqlite+aiosqlite:///./bouquet.db"

print(f"Using DATABASE_URL: {DATABASE_URL}")  # Debug print

# Create async engine
engine = create_async_engine(DATABASE_URL, echo=True)

# Create async session
AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

# Import Base from models
from models.base import Base

# Dependency to get database session
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

# Initialize database
async def init_db():
    print("Initializing database...")
    async with engine.begin() as conn:
        # Import all models to ensure they're registered with Base
        from models.session import Session  # noqa
        
        print(f"Found {len(Base.metadata.tables)} tables to create")
        print("Creating tables...")
        await conn.run_sync(Base.metadata.create_all)
        print("Database initialization complete!")