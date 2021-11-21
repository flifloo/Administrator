import {Command} from "../../lib/Command";
import {ChatInputApplicationCommandData, CommandInteraction, GuildMember} from "discord.js";
import {Music} from "./index";
import {AudioPlayerStatus} from "@discordjs/voice";


export class StopCommand extends Command {
    data: ChatInputApplicationCommandData = {
        name: "stop",
        description: "Stop the music"
    };
    module: Music;

    constructor(module: Music) {
        super(module);
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
        } else if (player.audio.state.status == AudioPlayerStatus.Idle) {
            await interaction.editReply("Can't stop, there is no music");
            return;
        }

        player.stop();
        await interaction.followUp("Music stopped");
    }
}
