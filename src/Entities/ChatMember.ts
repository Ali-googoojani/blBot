import { User } from "./User";

export class ChatMember {
    public status: string;
    public user: User;
    constructor(status: string, user: User) {
        this.status=status;
        this.user=user;
    }
}