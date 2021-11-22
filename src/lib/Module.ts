import {Command} from "./Command";
import {Modules} from "./Modules";
import {Logger} from "./Logger";
import {readdirSync} from "fs";


export abstract class Module {
    modules: Modules;
    logger: Logger;
    loadedCommands: Command[] = [];

    protected constructor(modules: Modules, name: string) {
        this.modules = modules;
        this.logger = this.modules.client.logger.createChild(name);
    }

    get commands() {
        const folder = `${__dirname}/../modules/${this.constructor.name}/commands`;
        return readdirSync(folder, {withFileTypes: true})
            .filter(file => file.isDirectory() || file.name.endsWith(".js"))
            .map(file => (require(`${folder}/${file.name}`)[file.name.charAt(0).toUpperCase() + file.name.replace(/\.js$/, "").slice(1)+"Command"]));
    }

    async load() {
        const commands = this.commands.map(cmd => new cmd(this));
        await Promise.all(commands.map(cmd => cmd.load()));
        this.loadedCommands = this.loadedCommands.concat(commands);
    }

    async unload() {
        await Promise.all(this.loadedCommands.map(cmd => cmd.unload()));
        this.loadedCommands = [];
    }
}
