import { InputFile } from "./InputFile";

export class InputMedia {
    public type:string;
    public media:string | InputFile;
    public caption:string;

    constructor(type:string,media:string,caption:string) {
        this.type=type;
        this.media=media;
        this.caption=caption;
    }
}