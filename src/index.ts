import "fs";
import { Intents } from "discord.js";
import "./lib/Modules";
import {AdministratorClient} from "./lib/AdministratorClient";

const config = require("../config.json");
const client = new AdministratorClient({ intents: [Intents.FLAGS.GUILDS] });


client.once("ready", async () => {
    client.application = await client.application?.fetch() ?? null;
    await client.modules.loadAllModules();
    console.log("Started !");
});

client.on("interactionCreate", async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.modules.getCommand(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: "There was an error while executing this command !", ephemeral: true });
    }
});


void client.login(config.token);
