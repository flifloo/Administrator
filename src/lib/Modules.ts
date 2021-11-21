import { readdirSync } from "fs";
import {Module} from "./Module";
import {Command} from "./Command";
import {AdministratorClient} from "./AdministratorClient";

export class Modules {
    modules: Map<string, Module> = new Map<string, Module>();
    client: AdministratorClient;

    constructor(client: AdministratorClient) {
        this.client = client;
    }
    
    async load(name: string) {
        try {
            const module: Module = new (require(__dirname+`/../modules/${name}`)[name])(this);
            await module.load();
            this.modules.set(name, module);
            console.info(`Module ${name} loaded`)
        } catch (error) {
            console.error(`Fail to load module ${name}`);
            console.error(error);
            return false
        }
        return true;
    }
    
    async unload(name: string) {
        try {
            const module = this.modules.get(name);
            if (!module) {
                console.error(`Module ${name} not found`);
                return false;
            }
            await module.unload();
            this.modules.delete(name);
            console.info(`Module ${name} unloaded`)
        } catch (error) {
            console.error(`Fail to unload module ${name}`);
            console.error(error);
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
            await this.load(module.name);
    }
    
    async unloadAllModules() {
        for (const module of await this.allModules())
            await this.unload(module.name);
    }
    
    async reloadAllModules() {
        for (const module of await this.allModules())
            await this.reload(module.name);
    }

    getCommand(name: string): Command | null {
        for (const module of Array.from(this.modules.values()))
            for (const command of module.commands)
                if (command.data.name == name)
                    return command;

        return null;
    }
}
