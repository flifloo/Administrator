import {Command} from "../../../lib/Command";
import {CommandInteraction} from "discord.js";
import {Module} from "../../../lib/Module";

export class PingCommand extends Command {

    constructor(module: Module) {
        super(module, {
            name: "ping",
            description: "Replies with Pong and the bot ping"
        });
    }

    async execute(interaction: CommandInteraction) {
        const msg = `Pong !\nReceive: ${new Date().getTime() - interaction.createdAt.getTime()}ms`;
        const start = Date.now();
        await interaction.reply(msg);
        await interaction.editReply(`${msg}\nSend: ${Date.now() - start}ms`);
    }
}
