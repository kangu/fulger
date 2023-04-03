import { IPlugin } from "../plugin_manager"
import { IOrder } from "../api/orders"

interface IOrderWithLNInvoice extends IOrder {
    process_by_ln_invoice: boolean
}

const LN_InvoicePlugin: IPlugin = {
    transform(obj: IOrder): IOrderWithLNInvoice {
        let result: IOrderWithLNInvoice = <IOrderWithLNInvoice>obj
        result.process_by_ln_invoice = true
        return result
    }
}

module.exports = LN_InvoicePlugin
