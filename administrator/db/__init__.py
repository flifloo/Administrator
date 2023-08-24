from sqlalchemy.orm import declarative_base
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import sessionmaker


Base = declarative_base()


from . import UserSettings


async def init(settings):
    engine = create_async_engine(settings.db_url)
    async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    
    return sessionmaker(engine, class_=AsyncSession)
