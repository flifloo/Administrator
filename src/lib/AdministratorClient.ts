import {Client} from "discord.js";
import {Modules} from "./Modules";

export class AdministratorClient extends Client {

    modules: Modules = new Modules(this);
}
