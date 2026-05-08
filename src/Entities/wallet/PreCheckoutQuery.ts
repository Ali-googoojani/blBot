import { User } from "../User"

export type PreCheckoutQuery = {
    id: string,
    from: User,
    currency: string,
    total_amount: number,
    invoice_payload: string
}