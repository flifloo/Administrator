import {Command} from "../../../lib/Command";
import {ChatInputApplicationCommandData, CommandInteraction, GuildMember} from "discord.js";
import {Music} from "../index";
import {AudioPlayerStatus} from "@discordjs/voice";


export class SkipCommand extends Command {
    data: ChatInputApplicationCommandData = {
        name: "skip",
        description: "Skip the music"
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
            await interaction.editReply("Can't skip, there is no music");
            return;
        }

        await player.skip();
        await interaction.followUp("Music skipped");
    }
}
