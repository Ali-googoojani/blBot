import { KeyboardButton } from "./KeyboardButton";

export class ReplyKeyboardMarkup {
    public keyboard: Array<Array<KeyboardButton>>;
    constructor(keyboard: Array<Array<KeyboardButton>>) {
        this.keyboard = keyboard
    }
}