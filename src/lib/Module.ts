import {Command} from "./Command";
import {Modules} from "./Modules";

export class Module {
    commands: Command[] = new Array<Command>();
    modules: Modules;

    constructor(modules: Modules) {
        this.modules = modules;
    }

    async load() {
        await Promise.all(this.commands.map(cmd => cmd.load()));
    }

    async unload() {
        if (this.modules.client) {
            await Promise.all(this.commands.map(cmd => cmd.unload()))
        }
    }
}
