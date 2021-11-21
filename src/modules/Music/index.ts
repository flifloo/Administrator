import {Module} from "../../lib/Module";
import {Modules} from "../../lib/Modules";
import {PlayCommand} from "./play";
import {Snowflake} from "discord-api-types";
import {Player} from "./Player";
import {StopCommand} from "./stop";
import {PauseCommand} from "./pause";
import {SkipCommand} from "./skip";
import {ResumeCommand} from "./resume";
import {FlushCommand} from "./flush";
import {QueueCommand} from "./queue";
import {DisconnectCommand} from "./disconnect";


export class Music extends Module {
    players: Map<Snowflake, Player> = new Map<Snowflake, Player>();

    constructor(modules: Modules) {
        super(modules);
        this.commands.push(new PlayCommand(this));
        this.commands.push(new StopCommand(this));
        this.commands.push(new PauseCommand(this));
        this.commands.push(new ResumeCommand(this));
        this.commands.push(new SkipCommand(this));
        this.commands.push(new FlushCommand(this));
        this.commands.push(new QueueCommand(this));
        this.commands.push(new DisconnectCommand(this));
        // ToDo: stop if nobody in the channel
    }
}
