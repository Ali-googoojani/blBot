import { Message } from "./Message";
import { MessageAndUpdateId } from "./MessageAndUpdateId";

export class Result {
    public ok: string;
    public result: Array<MessageAndUpdateId>
    constructor(ok: string, result: Array<MessageAndUpdateId>) {
        this.ok = ok;
        this.result = result
    }
}