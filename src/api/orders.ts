export interface IOrderRequest {
    product: string
}

/* lightning compatible invoice */
/* can be passed over to external ln interfaces */
export interface ILN_Invoice {
    /* can be invisible turned off/deleted by setting to false */
    LN_Invoice: boolean
    ln_invoice_sats: number
    ln_invoice_memo: string
    ln_invoice_valid_until: string
}
