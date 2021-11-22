import {getInfo, videoInfo} from "ytdl-core";
import { AudioResource, createAudioResource, demuxProbe } from "@discordjs/voice";
import {exec as ytdl} from "youtube-dl-exec";
import {CommandInteraction, Message} from "discord.js";

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = async () => {};


export class Track {
    public readonly info: videoInfo;
    private readonly interaction: CommandInteraction;

    private constructor(info: videoInfo, interaction: CommandInteraction) {
        this.info = info;
        this.interaction = interaction
    }

    private async replyInteraction(message: string) {
        try {
            await this.interaction.followUp(message);
        } catch {
            await (await this.interaction.fetchReply() as Message).reply(message);
        }
    }

    async onStart() {
        this.onStart = noop;
        await this.replyInteraction("Now playing");
    }

    async onFinish() {
        this.onStart = noop;
    }

    async onError(error: Error) {
        this.onStart = noop;
        console.error(error);
        await this.replyInteraction("Error with this song, sorry :/");
    }

    public createAudioResource(): Promise<AudioResource<Track>> {
        return new Promise((resolve, reject) => {
            const process = ytdl(
                this.info.videoDetails.video_url,
                {
                    output: "-",
                    quiet: true,
                    format: 'bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio',
                    limitRate: '100K'
                },
                { stdio: ['ignore', 'pipe', 'ignore'] },
            );
            if (!process.stdout) {
                reject(new Error('No stdout'));
                return;
            }
            const stream = process.stdout;
            const onError = (error: Error) => {
                if (!process.killed) process.kill();
                stream.resume();
                reject(error);
            };
            process
                .once('spawn', () => {
                    demuxProbe(stream)
                        .then((probe: { stream: any; type: any; }) => resolve(createAudioResource(probe.stream, { metadata: this, inputType: probe.type })))
                        .catch(onError);
                })
                .catch(onError);
        });
    }

    public static async from(url: string, interaction: CommandInteraction): Promise<Track> {
        const info = await getInfo(url);

        return new Track(info, interaction);
    }
}
