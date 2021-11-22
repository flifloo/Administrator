import {Command} from "../../../lib/Command";
import {CommandInteraction, GuildMember} from "discord.js";
import {Music} from "../index";
import {AudioPlayerStatus} from "@discordjs/voice";


export class PauseCommand extends Command {
    module: Music;

    constructor(module: Music) {
        super(module, {
            name: "pause",
            description: "Pause the music"
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
        } else if ([AudioPlayerStatus.Playing, AudioPlayerStatus.Buffering].includes(player.audio.state.status)) {
            await interaction.editReply(`Can't pause, the music is ${player.audio.state.status}`);
            return;
        }

        player.pause();
        await interaction.followUp("Music paused");
    }
}
