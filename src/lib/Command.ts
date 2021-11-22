import {ApplicationCommandData, CommandInteraction} from "discord.js";
import {Module} from "./Module";


export abstract class Command {
    module: Module;
    data: ApplicationCommandData;

    constructor(module: Module) {
        this.module = module;
        this.data = null as any;
    }

    abstract execute(interaction: CommandInteraction): void;

    load(): any {

    };

    unload(): any {

    };
}
