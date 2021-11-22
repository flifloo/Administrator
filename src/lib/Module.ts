import {Command} from "./Command";
import {Modules} from "./Modules";
import {Logger} from "./Logger";
import {readdirSync, existsSync} from "fs";
import {Event} from "./Event";


export abstract class Module {
    modules: Modules;
    logger: Logger;
    loadedCommands: Command[] = [];
    loadedEvents: Event[] = [];

    protected constructor(modules: Modules, name: string) {
        this.modules = modules;
        this.logger = this.modules.client.logger.createChild(name);
    }

    private getComponent(name: string) {
        const folder = `${__dirname}/../modules/${this.constructor.name}/${name}`;
        if (existsSync(folder))
            return readdirSync(folder, {withFileTypes: true})
                .filter(file => file.isDirectory() || file.name.endsWith(".js"))
                .map(file => require(`${folder}/${file.name}`)[file.name.charAt(0).toUpperCase() + file.name.replace(/\.js$/, "").slice(1)+name.charAt(0).toUpperCase() + name.slice(1).replace(/s$/, "")]);
        else
            return [];
    }

    get commands() {
        return this.getComponent("commands");
    }

    get events() {
        return this.getComponent("events");
    }

    async load() {
        await this.loadCommands();
        await this.loadEvents();
    }

    async loadCommands() {
        const commands: Command[] = [];

        for (const command of this.commands) {
            try {
                const cmd: Command = new command(this);
                await cmd.load();
                commands.push(cmd);
            } catch (error) {
                this.logger.err(`Fail to load command ${command}`);
                this.logger.err(error);
            }
        }

        this.loadedCommands = this.loadedCommands.concat(commands);
    }

    async loadEvents() {
        const events: Event[] = [];

        for (const event of this.events) {
            try {
                const env: Event = new event(this);
                await env.load();
                events.push(env);
            } catch (error) {
                this.logger.err(`Fail to load event ${event}`);
                this.logger.err(error);
            }
        }

        this.loadedEvents = this.loadedEvents.concat(events);
    }

    async unload() {
        await Promise.all(this.loadedCommands.map(cmd => cmd.unload()));
        this.loadedCommands = [];
        await Promise.all(this.loadedEvents.map(cmd => cmd.unload()));
        this.loadedEvents = [];
    }
}
