export type SuccessfulPayment = {
    currency: string,
    total_amount: number,
    invoice_payload: string,
    telegram_payment_charge_id: string,
    provider_payment_charge_id: string

}