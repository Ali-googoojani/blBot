import { PhotoSize } from "./PhotoSize";
import { Sticker } from "./Sticker";

export class StickerSet {
    public name: string;
    public title: string;
    public sticker: Sticker[];
    public thumbnail: PhotoSize;
    constructor(name: string, title: string, stickers: Sticker[], thumbnail: PhotoSize) {
        this.name = name;
        this.title = title;
        this.sticker = stickers;
        this.thumbnail = thumbnail;
    }
}