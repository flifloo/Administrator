import {AboutCommand} from "./about";
import {Module} from "../../lib/Module";
import {Modules} from "../../lib/Modules";
import {InfoCommand} from "./info";
import {PingCommand} from "./ping";

export class Utils extends Module {

    constructor(modules: Modules) {
        super(modules);
        this.commands.push(new AboutCommand(this));
        this.commands.push(new InfoCommand(this));
        this.commands.push(new PingCommand(this))
    }
}
