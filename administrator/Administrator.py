from sqlalchemy.ext.asyncio import AsyncSession

from discord.ext.commands import Bot
from discord import Object


class Administrator(Bot):
    def __init__(self, *args, settings, session_maker, **kwargs):
        super().__init__(*args, **kwargs)
        self.settings = settings
        self.session_maker = session_maker
    
    async def setup_hook(self) -> None:
        for extension in self.settings.initial_extensions:
            await self.load_extension(extension)
        
        if self.settings.testing_guild_id:
            guild = Object(self.settings.testing_guild_id)
            self.tree.copy_global_to(guild=guild)
            await self.tree.sync(guild=guild)

    @property
    def session(self) -> AsyncSession:
        return self.session_maker()

    async def on_ready(self):
        print(f'We have logged in as {self.user}')
