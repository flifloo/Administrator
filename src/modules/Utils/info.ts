import {Command} from "../../lib/Command";
import {
    CategoryChannel,
    ChatInputApplicationCommandData,
    CommandInteraction,
    GuildMember,
    MessageEmbed,
    TextChannel,
    VoiceChannel
} from "discord.js";

const {Constants: { ApplicationCommandOptionTypes }} = require("discord.js");


export class InfoCommand extends Command {
    data: ChatInputApplicationCommandData = {
        name: "info",
        description: "Show information of the current guild or the specified user",
        options: [{
            type: ApplicationCommandOptionTypes.USER,
            name: "target",
            description: "The target user"
        }]
    };

    async execute(interaction: CommandInteraction) {
        let embed = new MessageEmbed();
        let target = interaction.options.get("target");

        if (target) {
            if (target.member && target.member instanceof GuildMember) {
                embed = embed.addField("DisplayName", target.member.displayName)
                    .addField("Joined at", target.member.joinedAt?.toString() || 'N/A');
                if (target.member.premiumSince)
                    embed = embed.addField("Guild premium since", target.member.premiumSince.toString());
            }

            embed = embed.setTitle(`${target.user?.username}#${target.user?.discriminator}`)
                .setAuthor("User info", target.user?.avatarURL() || '')
                .addField("Created at", target.user?.createdAt.toString() || 'N/A')
                .addField("ID", target.user?.id || 'N/A');

            //if (target.user?.bot)
            //    embed = embed.addField("Owner", (await target. .fetch()).owner.toString())
        } else {
            if (interaction.channel instanceof TextChannel) {
                embed = embed.setTitle(interaction.guild?.name || 'N/A')
                    .setAuthor("Guild infos", interaction.guild?.iconURL() || '');
                //.addField("Region", interaction.guild.voiceRegions())
                const owner = await interaction.guild?.fetchOwner();
                embed.addField("Owner", `${owner?.toString()}`);
                if (interaction.guild?.maximumPresences)
                    embed = embed.addField("Max presences", interaction.guild?.maximumPresences.toString() || 'N/A');
                if (interaction.guild?.description)
                    embed = embed.addField("Description", interaction.guild.description);
                embed = embed.addField("Two factor authorisation level", interaction.guild?.mfaLevel || 'N/A', true)
                    .addField("Verification level", interaction.guild?.verificationLevel || 'N/A', true)
                    .addField("Explicit content filter", interaction.guild?.explicitContentFilter || 'N/A', true)
                    .addField("Default notifications", interaction.guild?.defaultMessageNotifications.toString() || 'N/A', true);
                //if (interaction.guild.features)
                //    embed = embed.addField("Features", interaction.guild.features.length);
                if (interaction.guild?.large)
                    embed = embed.addField("Large", interaction.guild?.large ? "Yes" : "No", true);
                if (interaction.guild?.preferredLocale)
                    embed = embed.addField("Preferred locale", interaction.guild.preferredLocale, true);
                embed = embed.addField("Premium", `Tier: ${interaction.guild?.premiumTier} | Boosts: ${interaction.guild?.premiumSubscriptionCount}`);

                const channels = await interaction.guild?.channels.fetch();
                // ToDo news and store channels support
                embed = embed.addField("Channels", `Text: ${channels?.filter(c => c instanceof TextChannel).size} | Voice: ${channels?.filter(c => c instanceof VoiceChannel).size}\nCategories: ${channels?.filter(c => c instanceof CategoryChannel).size} | Total: ${channels?.size}`);


                embed = embed.addField("Members", `${interaction.guild?.memberCount}${interaction.guild?.maximumMembers ? "/"+interaction.guild.maximumMembers: ""}`, true)
                    .addField("Roles", (await interaction.guild?.roles.fetch())?.size.toString() || 'N/A', true)
                    .addField("Invites", (await interaction.guild?.invites.fetch())?.size.toString() || 'N/A', true)
                    .addField("Emojis", (await interaction.guild?.emojis.fetch())?.size.toString() || 'N/A', true)
                    .addField("Addons", `Webhooks: ${(await interaction.guild?.fetchWebhooks())?.size} | Integrations: ${(await interaction.guild?.fetchIntegrations())?.size}`);
                if (interaction.guild?.systemChannel)
                    embed = embed.addField("System channel", interaction.guild.systemChannel.toString());
                if (interaction.guild?.rulesChannel)
                    embed = embed.addField("Rules channel", interaction.guild.rulesChannel.toString());
                if (interaction.guild?.publicUpdatesChannel)
                    embed = embed.addField("Public updates channel", interaction.guild.publicUpdatesChannel.toString());
                embed = embed.addField("Created at", interaction.guild?.createdAt.toString() || 'N/A')
            }
        }

        embed = embed.setFooter("Administrator", interaction.client.application?.iconURL() || '');

        await interaction.reply({embeds: [embed]});
    }
}
