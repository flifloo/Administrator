import { readdirSync } from "fs";
import {Module} from "./Module";
import {Command} from "./Command";
import {AdministratorClient} from "./AdministratorClient";
import {ApplicationCommandData, ApplicationCommandManager} from "discord.js";

export class Modules {
    modules: Map<string, Module> = new Map<string, Module>();
    client: AdministratorClient;

    constructor(client: AdministratorClient) {
        this.client = client;
    }
    
    async load(name: string, createCommand: boolean = true) {
        try {
            const module: Module = new (require(__dirname+`/../modules/${name}`)[name])(this);
            await module.load();
            this.modules.set(name, module);

            if (createCommand)
                await this.registerCommand(module.loadedCommands.map(c => c.data));

            module.logger.info("loaded");
        } catch (error) {
            this.client.logger.err(`Fail to load module ${name}`);
            this.client.logger.err(error);
            return false
        }
        return true;
    }
    
    async unload(name: string) {
        try {
            const module = this.modules.get(name);
            if (!module) {
                this.client.logger.err(`Module ${name} not found`);
                return false;
            }
            await module.unload();
            this.modules.delete(name);
            this.client.logger.info(`Module ${name} unloaded`)
        } catch (error) {
            this.client.logger.err(`Fail to unload module ${name}`);
            this.client.logger.err(error);
            return false
        }
        return true;
    }
    
    async reload(name: string) {
        if (await this.unload(name))
            return await this.load(name);
        return false
    }
    
    async allModules() {
        return readdirSync(__dirname+"/../modules", {withFileTypes: true})
            .filter(file => file.isDirectory())
    }
    
    async loadAllModules() {
        for (const module of await this.allModules())
            await this.load(module.name, false);

        await this.registerCommand(this.allCommands().map(c => c.data), true);
    }
    
    async unloadAllModules() {
        for (const module of await this.allModules())
            await this.unload(module.name);
    }
    
    async reloadAllModules() {
        for (const module of await this.allModules())
            await this.reload(module.name);
    }

    async registerCommand(data: ApplicationCommandData | ApplicationCommandData[], set: boolean = false) {
        if (!this.client.application) {
            this.client.logger.err("Fail to register command, client application is undefined !");
            return;
        }

        let commands: ApplicationCommandManager = this.client.application.commands;

        if ("DEV" in process.env && process.env["DEV"] == "true") {
            await commands.set([]);
            commands = (await this.client?.guilds.fetch(process.env["DEVGUILD"] as any)).commands as any;
        }

        if (Array.isArray(data))
            if (set)
                await commands.set(data);
            else
                for (const d of data)
                    await commands.create(d);
        else
            if (set)
                await commands.set([data]);
            else
                await commands.create(data);
    }

    allCommands() : Command[] {
        return Array.from(this.modules.values()).map(m => m.loadedCommands).reduce((l, m) => l.concat(m));
    }

    getCommand(name: string): Command | null {
        for (const command of this.allCommands())
            if (command.data.name == name)
                return command;
        return null;
    }
}
