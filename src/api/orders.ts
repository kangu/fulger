import {getProducts, IProduct} from "./products"
import {IOrder, IOrderRequest, ITipRequest} from "../models/order"
import axios from "axios"
import {ISettings} from "./settings"
const uuid4 = require("uuid4")

const DB_ENDPOINT = `${process.env.COUCH}/${process.env.DB_NAME}`

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

export async function generateTip(request: ITipRequest, settings: ISettings, rates: object): Promise<IOrder> {
    const orderId = uuid4()
    let result: IOrder = {
        _id: `order-${orderId}`,
        products: [],
        fiat_currency: settings.currency,
        fiat_total: 0,
        order_currency: request.currency,
        order_total: request.value,
        sats_total: 0,
        timestamp: new Date().toISOString()
    }

    result.fiat_total = convertPrice(request.value, request.currency, settings.currency, rates)
    result.sats_total = convertPrice(request.value, request.currency, "SAT", rates)

    return result
}

export async function generateOrder(request: IOrderRequest, settings: ISettings, rates: object): Promise<IOrder> {
    // arrange products by quantity to be easily queried
    const orderId = uuid4()
    let result: IOrder = {
        _id: `order-${orderId}`,
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
    // console.log("Products", idAndQuantity, productIds, productDocs)

    // calculate total price in sats
    // then also in desired target currency for accounting
    // console.log("Accounting currency", settings.currency)
    // this would come from the settings document

    const satValue = await getOneSATPrice(request.currency)
    productDocs.forEach(product => {
        const baseFiatConversion = convertPrice(1, product.price_currency, request.currency, rates)
        const individualAdjustedPrice = baseFiatConversion * (product.price * idAndQuantity[product.name])
        result.order_total += individualAdjustedPrice
        result.products.push({
            id: product.name,
            quantity: idAndQuantity[product.name],
            total: individualAdjustedPrice
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
    // otherwise return 2 decimal points for fiat currencies
    // return at least 0.01 for one cent being the smallest denomination
    const roundedValue = Math.round((finalRate + Number.EPSILON) * 100) / 100
    return Math.max(roundedValue, 0.01)
}
