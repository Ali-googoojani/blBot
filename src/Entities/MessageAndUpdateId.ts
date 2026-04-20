import { Animation } from "./Animation";
import { Audio } from "./Audio";
import { Chat } from "./Chat";
import { InlineKeyboardButton } from "./InlineKeyboardButton";
import { Invoice } from "./Invoice";
import { Location } from "./Location";
import { Message } from "./Message";
import { MessageEntity } from "./MessageEntity";
import { PhotoSize } from "./PhotoSize";
import { Sticker } from "./Sticker";
import { User } from "./User";
import { Video } from "./Video";
import { Voice } from "./Voice";
import { WebAppData } from "./WebAppData";

export class MessageAndUpdateId {
    public update_id: number;
    public message: Message;

    constructor(update_id: number, message_id: number, from: User, date: number, chat: Chat, sender_chat: Chat, forward_from: User, forward_from_chat: Chat, forward_from_message_id: number, forward_date: number, reply_to_message: Message, edit_date: number, media_group_id: string, text: string, entities: Array<MessageEntity>, animation: Animation, audio: Audio, document: Document, photo: Array<PhotoSize>, sticker: Sticker, video: Video, voice: Voice, caption: string, caption_entities: Array<MessageEntity>, contact: Contact, location: Location, new_chat_members: Array<User>, left_chat_member: User, invoice: Invoice, successful_payment: string, web_app_data: WebAppData, reply_markup: InlineKeyboardButton) {

        this.message = {
            message_id: message_id,
            from: from,
            date: date,
            chat: chat,
            sender_chat: sender_chat,
            forward_from: forward_from,
            forward_from_chat: forward_from_chat,
            forward_from_message_id: forward_from_message_id,
            forward_date: forward_date,
            reply_to_message: reply_to_message,
            edit_date: edit_date,
            media_group_id: media_group_id,
            text: text,
            entities: entities,
            animation: animation,
            audio: audio,
            document: document,
            photo: photo,
            sticker: sticker,
            video: video,
            voice: voice,
            caption: caption,
            caption_entities: caption_entities,
            contact: contact,
            location: location,
            new_chat_members: new_chat_members,
            left_chat_member: left_chat_member,
            invoice: invoice,
            successful_payment: successful_payment,
            web_app_data: web_app_data,
            reply_markup: reply_markup,
        };
        this.update_id = update_id;



    }
}