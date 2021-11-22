import {Module} from "./Module";
import {Logger} from "./Logger";


export abstract class Component {
    module: Module;
    logger: Logger;

    protected constructor(module: Module, name: string | null = null) {
        this.module = module;
        this.logger = this.module.logger.createChild(name || this.constructor.name);
    }

    load(): any {

    };

    unload(): any {

    };
}
