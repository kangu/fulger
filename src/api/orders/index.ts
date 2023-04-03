import {getProducts, IProduct} from "../products"
import axios from "axios"
import {ISettings} from "../settings"

const DB_ENDPOINT = `${process.env.COUCH}/${process.env.DB_NAME}`

interface IProductInOrderRequest {
    id: string
    quantity: number
}

interface IProductInOrder {
    id: string
    quantity: number
    total: number
}

export interface IOrderRequest {
    products: Array<IProductInOrderRequest>
    currency: string,
    pay_with_legacy_fiat?: boolean
}

export interface IOrder {
    timestamp: string
    products: Array<IProductInOrder>
    order_currency: string
    order_total: number
    fiat_currency: string
    fiat_total: number
    sats_total: number
    pay_with_legacy_fiat?: boolean
    error?: string
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

export async function getOneSATPrice(currency: string): Promise<number> {
    try {
        const response = await axios.get(
            `${DB_ENDPOINT}/10kSATS`
        )
        if (response.data[currency]) {
            return Math.round(10000 / response.data[currency])
        }
        return null
    } catch (e) {
        return null
    }
}

export async function generateOrder(request: IOrderRequest, settings: ISettings, rates: object): Promise<IOrder> {
    // arrange products by quantity to be easily queried
    let result: IOrder = {
        products: [],
        fiat_currency: settings.currency,
        fiat_total: 0,
        order_currency: request.currency,
        order_total: 0,
        sats_total: 0,
        timestamp: new Date().toISOString(),
        pay_with_legacy_fiat: request.pay_with_legacy_fiat
    }
    const idAndQuantity = {}
    request.products.forEach(item => {
        idAndQuantity[item.id] = item.quantity
    })
    const productIds = Object.keys(idAndQuantity)

    // fetch products and return an error if one is missing
    const [productDocs, error] = await getProducts(productIds)
    if (error) {
        throw new Error(error)
    }
    console.log("Products", idAndQuantity, productIds, productDocs)

    // calculate total price in sats
    // then also in desired target currency for accounting
    console.log("Accounting currency", settings.currency)
    // this would come from the settings document

    const satValue = await getOneSATPrice(request.currency)
    productDocs.forEach(product => {
        result.order_total += product.price * idAndQuantity[product.name]
        result.products.push({
            id: product.name,
            quantity: idAndQuantity[product.name],
            total: product.price * idAndQuantity[product.name]
        })
    })
    result.fiat_total = convertPrice(result.order_total, request.currency, settings.currency, rates)
    result.sats_total = convertPrice(result.order_total, request.currency, "SAT", rates)

    return result
}

export function convertPrice(value, fromCurrency, toCurrency: string, ratesDoc: object): number {
    if (!ratesDoc.hasOwnProperty(fromCurrency) || !ratesDoc.hasOwnProperty(toCurrency)) {
        throw new Error(`Missing currency rates for: ${fromCurrency}->${toCurrency}`)
    }
    const rateBetweenCurrencies = ratesDoc[toCurrency] / ratesDoc[fromCurrency]
    // for sats, return rounded number
    const finalRate = value * rateBetweenCurrencies
    if (toCurrency === "SAT") {
        return Math.round(finalRate)
    }
    // otherwise return 2 decimal points
    return Math.round((finalRate + Number.EPSILON) * 100) / 100
}
