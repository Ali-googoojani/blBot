import { InputFile } from "./InputFile";


export class InputMediaDocument {
    public type: string;
    public media: string | InputFile;
    public thumbnail: InputFile | string;
    public caption: string;

    constructor(type: string, media: string, thumbnail: InputFile | string, caption: string) {
        this.type = type;
        this.media = media;
        this.thumbnail = thumbnail;
        this.caption = caption;
    }
}

