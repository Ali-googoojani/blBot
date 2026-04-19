export class User {
    public id:number;
    public is_bot:boolean;
    public frist_name:string;
    public last_name:string;
    public username:string;
    public language_code:string
    constructor(id:number,is_bot:boolean,frist_name:string,last_name:string,username:string,language_code:string) {
        this.id=id;
        this.is_bot=is_bot;
        this.frist_name=frist_name;
        this.last_name=last_name;
        this.username=username;
        this.language_code=language_code;
    }
}