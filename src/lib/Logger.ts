import "colors"

export enum LoggerLevel {
    INFO = "Info",
    LOG = "Log",
    WARN = "Warn",
    ERR = "Error"
}

export class Logger {
    private _name: string;
    private parent: Logger | null = null;
    children: Logger[] = [];

    constructor(name: string) {
        this._name = name;
    }

    public createChild(name: string): Logger {
        const child = new Logger(name);
        child.parent = this;
        this.children.push(child);
        return child;
    }

    get name(): string {
        if (this.parent)
            return `${this.parent.name} - ${this._name}`;
        return this._name;
    }

    set name(name: string) {
        this._name = name;
    }

    get date(): string {
        return new Date().toLocaleDateString();
    }

    private print(level: LoggerLevel, msg: any) {

        const message = `[${this.date}] {${level}} ${this.name}: ${msg.toString()}`;

        switch (level) {
            case LoggerLevel.INFO:
                console.info(message);
                break;
            case LoggerLevel.LOG:
                console.log(message.gray);
                break;
            case LoggerLevel.WARN:
                console.warn(message.yellow);
                break;
            case LoggerLevel.ERR:
                console.error(message.red);
        }

        if (msg instanceof Error)
            console.error(msg);
    }

    public info(msg: any) {
        this.print(LoggerLevel.INFO, msg);
    }

    public log(msg: any) {
        this.print(LoggerLevel.LOG, msg);
    }

    public warn(msg: any) {
        this.print(LoggerLevel.WARN, msg);
    }

    public err(msg: any) {
        this.print(LoggerLevel.ERR, msg);
    }
}
