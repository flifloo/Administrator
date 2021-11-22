import "fs";
import {Intents, Message} from "discord.js";
import "./lib/Modules";
import {AdministratorClient} from "./lib/AdministratorClient";

const config = require("../config.json");
const client = new AdministratorClient({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES] });


client.once("ready", async () => {
    await client.application?.fetch();
    if (client.user?.username)
        client.logger.name = client.user.username;
    await client.modules.loadAllModules();
    client.logger.info("Started !");
});

client.on("interactionCreate", async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.modules.getCommand(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        client.logger.err(error);
        const msg = {content: "There was an error while executing this command !", ephemeral: true};
        try {
            await interaction.reply(msg);
        } catch {
            try {
                await interaction.followUp(msg);
            } catch {
                try {
                    await (await interaction.fetchReply() as Message).reply(msg);
                } catch {
                    client.logger.warn("Cant send error message to the user :/");
                }
            }
        }
    }
});


void client.login(config.token);
