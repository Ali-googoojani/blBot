export class InputMediaPhoto {
    public type: string;
    public media: string;
    public caption: string;
    constructor(type: string, media: string, caption: string) {
        this.type = type;
        this.media = media;
        this.caption = caption;
    }
}