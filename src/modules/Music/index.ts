import {Module} from "../../lib/Module";
import {Modules} from "../../lib/Modules";
import {Snowflake} from "discord-api-types";
import {Player} from "./lib/Player";


export class Music extends Module {
    players: Map<Snowflake, Player> = new Map<Snowflake, Player>();

    constructor(modules: Modules) {
        super(modules, "Music");
        // ToDo: stop if nobody in the channel
    }
}
