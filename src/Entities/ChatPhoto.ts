export class ChatPhoto {

    public small_file_id: string;
    public small_file_unique_id: string;
    public big_file_id: string;
    public big_file_unique_id: string;

    constructor(small_file_id: string, small_file_unique_id: string, big_file_id: string, big_file_unique_id: string) {
        this.small_file_id = small_file_id;
        this.small_file_unique_id = small_file_unique_id;
        this.big_file_id = big_file_id;
        this.big_file_unique_id = big_file_unique_id;
    }
}