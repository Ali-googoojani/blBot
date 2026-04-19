import { ChatPhoto } from "./ChatPhoto";

export class ChatFullInfo {
    public id:number;
    public type:string;
    public title:string;
    public username:string;
    public frist_name:string;
    public last_name:string;
    public photo:ChatPhoto;
    public bio:string;
    public description:string;
    public invite_link:string;
    public linked_chat_id:string;

    constructor(id:number,type:string,title:string,username:string,frist_name:string,last_name:string,photo:ChatPhoto,bio:string,description:string,invite_link:string,linked_chat_id:string) {
        this.id=id;
        this.type=type;
        this.title=title;
        this.username=username;
        this.frist_name=frist_name;
        this.last_name=last_name;
        this.photo=photo;
        this.bio=bio;
        this.description=description;
        this.invite_link=invite_link;
        this.linked_chat_id=linked_chat_id
    }
}