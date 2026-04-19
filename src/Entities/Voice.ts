export class Voice {
    public file_id: string;
    public file_unique_id: string;
    constructor(file_id: string, file_unique_id: string) {
        this.file_id=file_id;
        this.file_unique_id=file_unique_id;
    }
}