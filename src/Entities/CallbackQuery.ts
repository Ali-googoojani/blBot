import { Message } from "./Message";
import { User } from "./User";

export class CallbackQuery {
    public id:string;
    public from:User;
    public message:Message;
    public data:string;
    constructor(id:string,from:User,message:Message,data:string) {
        this.id=id;
        this.from=from;
        this.message=message;
        this.data=data;
    }
}