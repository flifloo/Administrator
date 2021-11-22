import {Client} from "discord.js";
import {Modules} from "./Modules";
import {Logger} from "./Logger";

export class AdministratorClient extends Client {
    logger: Logger = new Logger("Core");
    modules: Modules = new Modules(this);
}
