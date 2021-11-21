import {Command} from "../../lib/Command";
import {ChatInputApplicationCommandData, CommandInteraction, MessageEmbed} from "discord.js";

export class AboutCommand extends Command {
    data: ChatInputApplicationCommandData = {
        name: "about",
        description: "Show information about the bot"
    };

    async execute(interaction: CommandInteraction) {
        const flifloo = await interaction.client.users.fetch("177393521051959306");

        // @ts-ignore
        const embed = new MessageEmbed().setTitle(interaction.guild ? interaction.guild.me.displayName : `${interaction.client.user.username}#${interaction.client.user.discriminator}`)
            .setDescription(interaction.client.application?.description as string) // @ts-ignore
            .setAuthor("Administrator", interaction.client.user.avatarURL(), "https://github.com/flifloo") // @ts-ignore
            .setFooter(`Made with ❤️ by ${flifloo.username}#${flifloo.discriminator}`, flifloo.avatarURL()) // @ts-ignore
            .addField("Owned by", interaction.client.application?.owner.toString())
            .addField("Guilds", (await interaction.client.guilds.fetch()).size.toString())
            .addField("Modules", this.module.modules.modules.size.toString())
            .addField("Commands", Array.from(this.module.modules.modules.values()).map(m => m.commands.length).reduce((sum, current) => sum+current).toString());

        await interaction.reply({embeds: [embed]});
    }
}
