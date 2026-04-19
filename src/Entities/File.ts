export class File {
    public file_id: string;
    public file_unique_id: string;
    public file_size: number;
    public file_path: string;

    constructor(file_id: string, file_unique_id: string, file_size: number, file_path: string) {
        this.file_id = file_id;
        this.file_unique_id = file_unique_id;
        this.file_size = file_size;
        this.file_path = file_path
    }
}