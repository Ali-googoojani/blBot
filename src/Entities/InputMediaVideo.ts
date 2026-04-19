import { InputFile } from "./InputFile";

export class InputMediaVideo {
    public type: string;
    public media: string;
    public thumbnail: InputFile | string;
    public caption: string;
    public width: number;
    public height: number;
    public duration: number;

    constructor(type: string, media: string, thumbnail: InputFile | string, caption: string, width: number, height: number, duration: number) {
        this.type = type;
        this.media = media;
        this.thumbnail = thumbnail;
        this.caption = caption;
        this.width = width;
        this.height = height;
        this.duration = duration;
    }
}