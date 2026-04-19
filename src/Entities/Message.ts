import { Animation } from "./Animation";
import { Audio } from "./Audio";
import { Chat } from "./Chat";
import { InlineKeyboardButton } from "./InlineKeyboardButton";
import { Invoice } from "./Invoice";
import { Location } from "./Location";
import { MessageEntity } from "./MessageEntity";
import { PhotoSize } from "./PhotoSize";
import { Sticker } from "./Sticker";
import { User } from "./User";
import { Video } from "./Video";
import { Voice } from "./Voice";
import { WebAppData } from "./WebAppData";

export class Message {
    public message_id?:number;
    public from?:User;
    public date?:number;
    public chat?:Chat
    public sender_chat?:Chat;
    public forward_from?:User;
    public forward_from_chat?:Chat;
    public forward_from_message_id?:number;
    public forward_date?:number;
    public reply_to_message?:Message;
    public edit_date?:number;
    public media_group_id?:string;
    public text?:string;
    public entities?:Array<MessageEntity>;
    public animation?:Animation;
    public audio?:Audio;
    public document?:Document;
    public photo?:Array<PhotoSize>;
    public sticker?:Sticker;
    public video?:Video;
    public voice?:Voice;
    public caption?:string;
    public caption_entities?:Array<MessageEntity>;
    public contact?:Contact;
    public location?:Location;
    public new_chat_members?:Array<User>;
    public left_chat_member?:User;
    public invoice?:Invoice;
    public successful_payment?:string;
    public web_app_data?:WebAppData;
    public reply_markup?:InlineKeyboardButton;
    constructor(
        message_id:number,
        from:User,
        date:number,
        chat:Chat,
        sender_chat:Chat,
        forward_from:User,
        forward_from_chat:Chat,
        forward_from_message_id:number,
        forward_date:number,
        reply_to_message:Message,
        edit_date:number,
        media_group_id:string,
        text:string,
        entities:Array<MessageEntity>,
        animation:Animation,
        audio:Audio,
        document:Document,
        photo:Array<PhotoSize>,
        sticker:Sticker,
        video:Video,
        voice:Voice,
        caption:string,
        caption_entities:Array<MessageEntity>,
        contact:Contact,
        location:Location,
        new_chat_members:Array<User>,
        left_chat_member:User,
        invoice:Invoice,
        successful_payment:string,
        web_app_data:WebAppData,
        reply_markup:InlineKeyboardButton

    ) {
        this.message_id=message_id;
        this.from=from;
        this.date=date;
        this.chat=chat;
        this.sender_chat=sender_chat;
        this.forward_from=forward_from;
        this.forward_from_chat=forward_from_chat;
        this.forward_from_message_id=forward_from_message_id;
        this.forward_date=forward_date;
        this.reply_to_message=reply_to_message;
        this.edit_date=edit_date;
        this.media_group_id=media_group_id;
        this.text=text;
        this.entities=entities;
        this.animation=animation;
        this.audio=audio;
        this.document=document;
        this.photo=photo;
        this.sticker=sticker;
        this.video=video;
        this.voice=voice;
        this.caption=caption;
        this.caption_entities=caption_entities;
        this.contact=contact;
        this.location=location;
        this.new_chat_members=new_chat_members;
        this.left_chat_member=left_chat_member;
        this.invoice=invoice;
        this.successful_payment=successful_payment;
        this.web_app_data=web_app_data;
        this.reply_markup=reply_markup;
    }
}
