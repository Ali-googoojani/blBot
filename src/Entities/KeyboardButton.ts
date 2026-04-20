import { WebAppInfo } from "./WebAppInfo";

export class KeyboardButton {
    public text:string;
    public request_contact?:boolean;
    public request_location?:boolean;
    public web_app?:WebAppInfo;
    constructor(text:string,request_contact:boolean,request_location:boolean,web_app:WebAppInfo) {
        this.text=text;
        this.request_contact=request_contact;
        this.request_location=request_location;
        this.web_app=web_app;
    }
}