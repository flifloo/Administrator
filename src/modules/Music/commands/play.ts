import {Command} from "../../../lib/Command";
import {CommandInteraction, GuildMember, VoiceChannel} from "discord.js";
import {Music} from "../index";
import {Player} from "../lib/Player";
import {Track} from "../lib/Track";
import {entersState, VoiceConnectionStatus} from "@discordjs/voice";
const {Constants: { ApplicationCommandOptionTypes }} = require("discord.js");

export class PlayCommand extends Command {
    module: Music;

    constructor(module: Music) {
        super(module, {
            name: "play",
            description: "Play a music",
            options: [{
                type: ApplicationCommandOptionTypes.STRING,
                name: "music",
                description: "The music to play",
                required: true
            }]
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
            if (! interaction.member.voice.channel || ! (interaction.member.voice.channel instanceof VoiceChannel)) {
                await interaction.editReply("You must be connected into a voice channel !");
                return;
            } else if (!interaction.member.voice.channel.joinable) {
                await interaction.editReply("The bot doesn't have the permission to join this voice channel :/");
                return;
            }

            player = new Player(interaction.member.voice.channel);
            this.module.players.set(interaction.guild.id, player);
        } else if (interaction.member.voice.channelId != player.connexion.joinConfig.channelId) {
            await interaction.editReply("You must be in the same voice channel !");
            return;
        }

        try {
            await entersState(player.connexion, VoiceConnectionStatus.Ready, 20e3);
        } catch (error) {
            this.logger.warn("Fail to enter state Ready !");
            await interaction.followUp("Failed to join voice channel within 20 seconds, please try again later !");
            return;
        }

        const url = interaction.options.get("music")!.value! as string;

        try {
            const track = await Track.from(url, interaction);
            player.enqueue(track);
            await interaction.followUp(`${track.info.videoDetails.title} added to queue`);
        } catch (error) {
            this.logger.err(error);
            await interaction.followUp("Fail to add to queue")
        }
    }
}
