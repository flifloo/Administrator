import {ApplicationCommandData, CommandInteraction} from "discord.js";
import {Module} from "./Module";
import {Logger} from "./Logger";


export abstract class Command {
    module: Module;
    data: ApplicationCommandData;
    logger: Logger;

    protected constructor(module: Module, data: ApplicationCommandData) {
        this.module = module;
        this.data = data;
        this.logger = this.module.logger.createChild(this.data.name);
    }

    abstract execute(interaction: CommandInteraction): void;

    load(): any {

    };

    unload(): any {

    };
}
