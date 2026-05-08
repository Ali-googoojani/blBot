import { Message } from "./Message";
import { MessageAndUpdateId } from "./MessageAndUpdateId";
import { Update } from "./Update";

export class Result {
    public ok: string;
    public result: Array<Update>
    constructor(ok: string, result: Array<Update>) {
        this.ok = ok;
        this.result = result
    }
}