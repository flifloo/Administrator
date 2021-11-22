import {VoiceChannel} from "discord.js";
import {
    AudioPlayer,
    AudioPlayerState,
    AudioPlayerStatus,
    AudioResource,
    createAudioPlayer,
    entersState,
    joinVoiceChannel,
    VoiceConnection,
    VoiceConnectionDisconnectReason,
    VoiceConnectionState,
    VoiceConnectionStatus
} from '@discordjs/voice';
import {promisify} from "util";
import {Track} from "./Track";

const wait = promisify(setTimeout);


export class Player {
    readonly connexion: VoiceConnection;
    readonly audio: AudioPlayer;
    current: Track | null = null;
    queue: Track[] = [];
    readyLock: boolean = false;
    queueLock: boolean = false;

    constructor(voiceChanel: VoiceChannel) {
        this.connexion = joinVoiceChannel({channelId: voiceChanel.id, guildId: voiceChanel.guildId, selfDeaf: true, selfMute: false, adapterCreator: voiceChanel.guild.voiceAdapterCreator as any});
        this.audio = createAudioPlayer();

        this.connexion.on("error", console.warn);
        this.audio.on('error', (error: { resource: any; }) => (error.resource as AudioResource<Track>).metadata.onError(error as any));
        this.connexion.on("stateChange", async (_: VoiceConnectionState, newState: VoiceConnectionState) => {
            if (newState.status === VoiceConnectionStatus.Disconnected) {
                if (newState.reason === VoiceConnectionDisconnectReason.WebSocketClose && newState.closeCode === 4014) {
                    try {
                        await entersState(this.connexion, VoiceConnectionStatus.Connecting, 5_000);
                    } catch {
                        this.connexion.destroy();
                    }
                } else if (this.connexion.rejoinAttempts < 5) {
                    await wait((this.connexion.rejoinAttempts + 1) * 5_000);
                    this.connexion.rejoin();
                } else {
                    this.connexion.destroy();
                }
            } else if (newState.status === VoiceConnectionStatus.Destroyed) {
                this.stop();
            } else if (
                !this.readyLock &&
                (newState.status === VoiceConnectionStatus.Connecting || newState.status === VoiceConnectionStatus.Signalling)
            ) {
                this.readyLock = true;
                try {
                    await entersState(this.connexion, VoiceConnectionStatus.Ready, 20_000);
                } catch (e) {
                    if (this.connexion.state.status !== VoiceConnectionStatus.Destroyed) this.connexion.destroy();
                } finally {
                    this.readyLock = false;
                }
            }
        });
        this.audio.on('stateChange', (oldState: AudioPlayerState, newState: AudioPlayerState) => {
            if (newState.status === AudioPlayerStatus.Idle && oldState.status !== AudioPlayerStatus.Idle) {
                (oldState.resource as AudioResource<Track>).metadata.onFinish();
                void this.processQueue();
            } else if (newState.status === AudioPlayerStatus.Playing) {
                (newState.resource as AudioResource<Track>).metadata.onStart();
            }
        });

        this.connexion.subscribe(this.audio);
    }

    public enqueue(track: Track) {
        this.queue.push(track);
        void this.processQueue();
    }

    public pause() {
        this.audio.pause();
    }

    public resume() {
        this.audio.unpause();
    }

    public async skip() {
        this.audio.stop(true);
        await this.processQueue();
    }

    public stop() {
        this.queueLock = true;
        this.queue = [];
        this.audio.stop(true);
    }

    public disconnect() {
        if (this.audio.state.status != AudioPlayerStatus.Idle)
            this.stop();
        this.connexion.disconnect();
    }

    public flush() {
        this.queue = [];
    }

    private async processQueue(): Promise<void> {
        if (this.queueLock || this.audio.state.status !== AudioPlayerStatus.Idle || this.queue.length === 0) {
            return;
        }

        this.queueLock = true;

        const nextTrack = this.queue.shift()!;
        try {
            const resource = await nextTrack.createAudioResource();
            this.audio.play(resource);
            this.queueLock = false;
            this.current = nextTrack;
        } catch (error) {
            await nextTrack.onError(error as Error);
            this.queueLock = false;
            this.current = null;
            return this.processQueue();
        }
    }
}
