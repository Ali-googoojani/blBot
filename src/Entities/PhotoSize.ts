export class PhotoSize {
    public file_id:string;
    public file_unique_id:string;
    public width:number;
    public height:number;
    public file_size:number;

    constructor(file_id:string,file_unique_id:string,width:number,height:number,file_size:number) {
        this.file_id=file_id;
        this.file_unique_id=file_unique_id;
        this.width=width;
        this.height=height;
        this.file_size=file_size;
    }
}