import {ApplicationCommandData, CommandInteraction} from "discord.js";
import {Module} from "./Module";
import {Component} from "./Component";


export abstract class Command extends Component {
    data: ApplicationCommandData;

    protected constructor(module: Module, data: ApplicationCommandData) {
        super(module, data.name);
        this.module = module;
        this.data = data;
        this.logger = this.module.logger.createChild(this.data.name);
    }

    abstract execute(interaction: CommandInteraction): void;
}
