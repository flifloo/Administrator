import {
    ApplicationCommand, ApplicationCommandData,
    CommandInteraction,
    GuildResolvable,
} from "discord.js";
import {Module} from "./Module";


export abstract class Command {
    module: Module;
    data: ApplicationCommandData;
    scope: ApplicationCommand<{ guild: GuildResolvable }> | undefined;

    constructor(module: Module) {
        this.module = module;
        this.data = null as any;
    }

    abstract execute(interaction: CommandInteraction): void;

    async register() {
        try {
            if ("DEV" in process.env && process.env["DEV"] == "true") {
                const devGuild = await this.module.modules.client?.guilds.fetch(process.env["DEVGUILD"] as any);
                this.scope = await devGuild.commands.create(this.data); // ToDo: use only one call to avoid spamming the api
            } else {
                this.scope = await this.module.modules.client?.application?.commands.create(this.data);
            }

            console.log("Successfully registered commands " + this.scope?.name);
        } catch (error) {
            console.error(error);
        }
    }

    async isRegister(): Promise<boolean> {
        if (this.scope)
            return !! await this.module.modules.client?.application?.commands.fetch(this.scope.id); // ToDo: use only one call to avoid spamming the api

        return false;
    }

    async load() {
        if (!await this.isRegister())
            await this.register();
    }

    async unload() {
        if (await this.isRegister())
            await this.unload();
    }
}
