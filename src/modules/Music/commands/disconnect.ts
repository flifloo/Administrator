import {Command} from "../../../lib/Command";
import {CommandInteraction, GuildMember} from "discord.js";
import {Music} from "../index";


export class DisconnectCommand extends Command {
    module: Music;

    constructor(module: Music) {
        super(module, {
            name: "disconnect",
            description: "Stop the music"
        });
        this.module = module;
    }

    async execute(interaction: CommandInteraction) {
        await interaction.deferReply();
        if (!interaction.guild || ! (interaction.member instanceof GuildMember)) {
            await interaction.editReply("This command is only usable in a guild :/");
            return;
        }

        let player = this.module.players.get(interaction.guild.id);

        if (!player) {
            await interaction.editReply("No music currently playing !");
            return;
        } else if (interaction.member.voice.channelId != player.connexion.joinConfig.channelId) {
            await interaction.editReply("You must be in the same voice channel !");
            return;
        }

        player.disconnect();
        await interaction.followUp("Bot disconnected");
    }
}
