import {Command} from "../../../lib/Command";
import {CommandInteraction, GuildMember} from "discord.js";
import {Music} from "../index";


export class FlushCommand extends Command {
    module: Music;

    constructor(module: Music) {
        super(module, {
            name: "flush",
            description: "Flush the music queue"
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
        } else if (!player.queue.length) {
            await interaction.editReply("Can't flush queue, there is no music left");
            return;
        }

        player.flush();
        await interaction.followUp("Queue flushed");
    }
}
