export class MessageEntity {
    public type:string;
    public offset:number;
    public length:number;
    constructor(type:string,offset:number,length:number) {
        this.type=type;
        this.offset=offset;
        this.length=length;
    }
}