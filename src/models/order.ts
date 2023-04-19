import {ICouchDoc} from "../api/couch"

interface IProductInOrder {
    id: string
    quantity: number
    total: number
}

export interface IOrder extends ICouchDoc {
    // _id: string
    // _rev?: string
    // _attachments?: object
    timestamp: string
    products: Array<IProductInOrder>
    order_currency: string
    order_total: number
    fiat_currency: string
    fiat_total: number
    sats_total: number
    pay_with_legacy_fiat?: boolean
    error?: string
    test?: boolean
    settled?: boolean
}

/* Order request below is what comes directly from the frontend */

interface IProductInOrderRequest {
    id: string
    quantity: number
}

export interface IOrderRequest {
    products: Array<IProductInOrderRequest>
    currency: string,
    pay_with_legacy_fiat?: boolean,
    /* env for testing */
    env?: object
    immediate?: boolean // if set, skips the waiting part for the external lnd invoice to be generated
}
