import asyncio
from logging import getLogger, Formatter, INFO
from logging.handlers import RotatingFileHandler

from discord import Intents
from discord.ext.commands import when_mentioned

import settings
from Administrator import Administrator
from db import init as init_db


async def main():
    logger = getLogger('discord')
    logger.setLevel(INFO)

    handler = RotatingFileHandler(
        filename='discord.log',
        encoding='utf-8',
        maxBytes=32 * 1024 * 1024,  # 32 MiB
        backupCount=5,  # Rotate through 5 files
    )
    dt_fmt = '%Y-%m-%d %H:%M:%S'
    formatter = Formatter('[{asctime}] [{levelname:<8}] {name}: {message}', dt_fmt, style='{')
    handler.setFormatter(formatter)
    logger.addHandler(handler)

    session_maker = await init_db(settings)

    async with Administrator(when_mentioned, intents=Intents.default(), settings=settings, session_maker=session_maker) as bot:
        await bot.start(settings.token)

asyncio.run(main())
