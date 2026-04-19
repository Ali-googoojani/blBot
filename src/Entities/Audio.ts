export class Audio {
    public file_id: string;
    public file_unique_id: string;
    public duration: number;
    public title: string;
    public file_name: string;
    public mime_type: string;
    public file_size: number;

    constructor(
        file_id: string, file_unique_id: string, duration: number, title: string, file_name: string, mime_type: string, file_size: number
    ) {
        this.file_id = file_id;
        this.file_unique_id = file_unique_id;
        this.duration = duration;
        this.title = title;
        this.file_name = file_name;
        this.mime_type = mime_type;
        this.file_size = file_size;
    }
}

