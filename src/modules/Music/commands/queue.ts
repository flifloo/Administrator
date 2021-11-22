import {Command} from "../../../lib/Command";
import {ChatInputApplicationCommandData, CommandInteraction, GuildMember} from "discord.js";
import {Music} from "../index";
import {AudioPlayerStatus} from "@discordjs/voice";


function millisecondsToTime(milli: number): string {
    const seconds = Math.floor((milli / 1000) % 60);
    const minutes = Math.floor((milli / (60 * 1000)) % 60);

    return ('0' + minutes).slice(-2) + ":" + ('0' + seconds).slice(-2);
}

export class QueueCommand extends Command {
    data: ChatInputApplicationCommandData = {
        name: "queue",
        description: "Display the current queue"
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
            await interaction.editReply("There is no queue to display");
            return;
        }

        let queue = "";

        if (player.queue.length) {
            queue = player.queue.map((m, n) => `${n}. ${m.info.videoDetails.title}`).join("\n") + "\n";
        }

        let barr = "";
        if ([AudioPlayerStatus.Playing, AudioPlayerStatus.Paused, AudioPlayerStatus.AutoPaused].includes(player.audio.state.status)) {
            // @ts-ignore
            const duration: number = player.current?.info.videoDetails.lengthSeconds * 1000;
            // @ts-ignore
            const current: number = player.audio.state.playbackDuration;

            const maxSize = 35;
            const progress = Math.ceil((current/duration)*maxSize);
            barr = `\n${player.current?.info.videoDetails.title}\n${millisecondsToTime(current)} [${"=".repeat(progress)}${"-".repeat(maxSize-progress)}] ${millisecondsToTime(duration)}\n`
        }

        await interaction.followUp(`\`\`\`md\n${queue}${barr}\`\`\``);
    }
}
