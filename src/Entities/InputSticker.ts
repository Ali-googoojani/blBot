import { InputFile } from "./InputFile";
import { MaskPosition } from "./MaskPosition";

export type InputSticker = {
    sticker: InputFile | string;
    emoji: string;
    mask_position?: MaskPosition;
};