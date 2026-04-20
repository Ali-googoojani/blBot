import { CopyTextButton } from "./CopyTextButton";
import { WebAppInfo } from "./WebAppInfo";

export class InlineKeyboardButton {
    public text: string;
    public url?: string;
    public callback_data?: string;
    public web_app?: WebAppInfo;
    public copy_text?: CopyTextButton;

    constructor(text: string, url?: string, callback_data?: string, web_app?: WebAppInfo, copy_text?: CopyTextButton) {
        this.text = text;
        this.url = url
        this.callback_data = callback_data;
        this.web_app = web_app;
        this.copy_text = copy_text;
    }
}