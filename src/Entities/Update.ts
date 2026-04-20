import { CallbackQuery } from "./CallbackQuery";
import { Message } from "./Message";

export class Update {
    public update_id: number;
    public callback_query?: CallbackQuery;
    public message?: Message;

    constructor(update_id: number, callback_query?: CallbackQuery, message?: Message) {
        this.update_id = update_id;
        this.callback_query = callback_query;
        this.message = message;
    }
}