from discord import Interaction, app_commands, Object
from discord.ext.commands import Cog, Bot


class Test(Cog):
  def __init__(self, bot: Bot) -> None:
    self.bot = bot
    
  @app_commands.command(name="ping")
  async def ping(self, interaction: Interaction) -> None:
    await interaction.response.send_message("Pong !", ephemeral=True)


async def setup(bot: Bot) -> None:
  await bot.add_cog(Test(bot))
