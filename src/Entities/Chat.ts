export class Chat {
    public id:number;
    public type:string;
    public title:string;
    public username:string;
    public first_name:string;
    public last_name:string;

    constructor(id:number,type:string,title:string,username:string,first_name:string,last_name:string) {
        this.id=id;
        this.type=type;
        this.title=title;
        this.username=username;
        this.first_name=first_name;
        this.last_name=last_name;
    }
}