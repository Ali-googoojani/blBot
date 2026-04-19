import { InlineKeyboardButton } from "./InlineKeyboardButton";

export class InlineKeyboardMarkup {
    public inline_keyboard: Array<Array<InlineKeyboardButton>>;
    constructor(inline_keyboard: Array<Array<InlineKeyboardButton>>) {
        this.inline_keyboard = inline_keyboard;
    }
}