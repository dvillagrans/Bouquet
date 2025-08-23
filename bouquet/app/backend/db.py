from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
import os
from dotenv import load_dotenv

load_dotenv()

# Database URL
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "sqlite:///./bouquet.db"
)

# Create engine (sync for SQLite, async for PostgreSQL)
if DATABASE_URL.startswith("sqlite"):
    # SQLite sync engine
    from sqlalchemy import create_engine
    engine = create_engine(DATABASE_URL, echo=True)
    from sqlalchemy.orm import sessionmaker
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    # Dependency to get database session (sync)
    def get_db():
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()
else:
    # PostgreSQL async engine
    ASYNC_DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
    engine = create_async_engine(ASYNC_DATABASE_URL, echo=True)

# Create async session
AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

# Base class for models
Base = declarative_base()

# Dependency to get database session
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

# Initialize database
async def init_db():
    if DATABASE_URL.startswith("sqlite"):
        # SQLite sync initialization
        from models import session  # noqa
        Base.metadata.create_all(bind=engine)
    else:
        # PostgreSQL async initialization
        async with engine.begin() as conn:
            from models import session  # noqa
            await conn.run_sync(Base.metadata.create_all)