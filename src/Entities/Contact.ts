class Contact {
    public phone_number: string;
    public first_name: string;
    public last_name: string;
    public user_id: number;
    constructor(phone_number: string, first_name: string, last_name: string, user_id: number) {
        this.phone_number = phone_number;
        this.first_name = first_name;
        this.last_name = last_name;
        this.user_id = user_id;
    }
}