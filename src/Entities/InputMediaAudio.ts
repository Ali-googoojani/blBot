import { InputFile } from "./InputFile";

export class InputMediaAudio {
    public type: string;
    public media: string;
    public thumbnail: InputFile | string;
    public caption: string;
    public duration: number;
    public title: string;

    constructor(type: string, media: string, thumbnail: InputFile | string, caption: string, duration: number, title: string) {
        this.type = type;
        this.media = media;
        this.thumbnail = thumbnail;
        this.caption = caption;
        this.duration = duration;
        this.title = title;
    }
}