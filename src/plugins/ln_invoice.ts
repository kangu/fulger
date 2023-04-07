import { IPlugin } from "../plugin_manager"
import { IOrder } from "../api/orders"

interface IOrderWithLNInvoice extends IOrder {
    LN_Invoice: boolean
    ln_invoice_sats: number
    ln_invoice_expire_ms: number
    ln_invoice_memo?: string
    ln_invoice_req?: string  // this is the main lnbc code
    ln_invoice_created_at?: string
    ln_invoice_settled_at?: string
}

const LN_InvoicePlugin: IPlugin = {
    transform(obj: IOrder): IOrderWithLNInvoice {
        let result: IOrderWithLNInvoice = <IOrderWithLNInvoice>obj
        if (result.pay_with_legacy_fiat) {
            // if paying with fiat, just skip the whole invoice
            return result
        }
        result.LN_Invoice = true
        result.ln_invoice_sats = result.sats_total
        // for now memo is the same as the order id
        result.ln_invoice_memo = result._id
        result.ln_invoice_expire_ms = 1000 * 60 * 60 * 24 // default to 24h
        return result
    }
}

module.exports = LN_InvoicePlugin
