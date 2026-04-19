export class Invoice {
    public title: string;
    public description: string;
    public total_amount: number;
    constructor(title: string, description: string, total_amount: number) {
        this.title = title;
        this.description = description
        this.total_amount = total_amount;
    }
}