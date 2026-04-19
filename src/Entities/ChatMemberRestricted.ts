import { User } from "./User";

class ChatMemberRestricted {
    public status: string;
    public user: User;
    public is_member: boolean;
    public can_send_messages: boolean;
    public can_send_audios: boolean;
    public can_send_documents: boolean;
    public can_send_photos: boolean;
    public can_send_videos: boolean;
    public can_change_info: boolean;
    public can_invite_users: boolean;
    public can_pin_messages: boolean;
    constructor(status: string, user: User, is_member: boolean, can_send_messages: boolean, can_send_audios: boolean, can_send_documents: boolean, can_send_photos: boolean, can_send_videos: boolean, can_change_info: boolean, can_invite_users: boolean, can_pin_messages: boolean) {
        this.status = status;
        this.user = user;
        this.is_member = is_member;
        this.can_send_messages = can_send_messages;
        this.can_send_audios = can_send_audios;
        this.can_send_documents = can_send_documents;
        this.can_send_photos = can_send_photos;
        this.can_send_videos = can_send_videos;
        this.can_change_info = can_change_info;
        this.can_invite_users = can_invite_users;
        this.can_pin_messages = can_pin_messages;
    }
}