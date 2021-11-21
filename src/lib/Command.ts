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
            this.scope = await this.module.modules.client?.application?.commands.create(this.data);

            console.log("Successfully registered commands " + this.scope?.name);
        } catch (error) {
            console.error(error);
        }
    }

    async isRegister(): Promise<boolean> {
        if (this.scope)
            return !! await this.module.modules.client?.application?.commands.fetch(this.scope.id);

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
