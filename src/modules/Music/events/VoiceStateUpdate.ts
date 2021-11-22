import {Event} from "../../../lib/Event";
import {VoiceState} from "discord.js";
import {Music} from "../index";

export class VoiceStateUpdateEvent extends Event {
    module: Music;
    private readonly callback;

    constructor(module: Music) {
        super(module);
        this.module = module;
        this.callback = async (oldState: VoiceState, newState: VoiceState) => {
            const player = this.module.players.get(oldState.guild.id);

            if (!player)
                return;

            if (!oldState.channel || oldState.channelId != player.connexion.joinConfig.channelId || (newState.channelId == oldState.channelId))
                return;

            await oldState.channel.fetch(true);
            if (oldState.channel.members.size == 1) {
                player.disconnect();
                this.module.players.delete(oldState.guild.id);
            }
        }
    }

    load() {
        this.module.modules.client.on("voiceStateUpdate", this.callback);
    }

    unload() {
        this.module.modules.client.removeListener("voiceStateUpdate", this.callback);
    }
}
