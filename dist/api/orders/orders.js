"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertPrice = exports.generateOrder = exports.getOneSATPrice = void 0;
const products_1 = require("../products");
const axios_1 = require("axios");
const nanoid_1 = require("nanoid");
const DB_ENDPOINT = `${process.env.COUCH}/${process.env.DB_NAME}`;
function getOneSATPrice(currency) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(`${DB_ENDPOINT}/10kSATS`);
            if (response.data[currency]) {
                return Math.round(10000 / response.data[currency]);
            }
            return null;
        }
        catch (e) {
            return null;
        }
    });
}
exports.getOneSATPrice = getOneSATPrice;
function generateOrder(request, settings, rates) {
    return __awaiter(this, void 0, void 0, function* () {
        // arrange products by quantity to be easily queried
        console.log('generating order');
        const orderId = (0, nanoid_1.nanoid)();
        let result = {
            _id: "test",
            // _id: `order-${orderId}`,
            products: [],
            fiat_currency: settings.currency,
            fiat_total: 0,
            order_currency: request.currency,
            order_total: 0,
            sats_total: 0,
            timestamp: new Date().toISOString(),
            pay_with_legacy_fiat: request.pay_with_legacy_fiat
        };
        const idAndQuantity = {};
        request.products.forEach(item => {
            idAndQuantity[item.id] = item.quantity;
        });
        const productIds = Object.keys(idAndQuantity);
        // fetch products and return an error if one is missing
        const [productDocs, error] = yield (0, products_1.getProducts)(productIds);
        if (error) {
            throw new Error(error);
        }
        // console.log("Products", idAndQuantity, productIds, productDocs)
        // calculate total price in sats
        // then also in desired target currency for accounting
        // console.log("Accounting currency", settings.currency)
        // this would come from the settings document
        const satValue = yield getOneSATPrice(request.currency);
        productDocs.forEach(product => {
            result.order_total += product.price * idAndQuantity[product.name];
            result.products.push({
                id: product.name,
                quantity: idAndQuantity[product.name],
                total: product.price * idAndQuantity[product.name]
            });
        });
        result.fiat_total = convertPrice(result.order_total, request.currency, settings.currency, rates);
        result.sats_total = convertPrice(result.order_total, request.currency, "SAT", rates);
        return result;
    });
}
exports.generateOrder = generateOrder;
function convertPrice(value, fromCurrency, toCurrency, ratesDoc) {
    if (!ratesDoc.hasOwnProperty(fromCurrency) || !ratesDoc.hasOwnProperty(toCurrency)) {
        throw new Error(`Missing currency rates for: ${fromCurrency}->${toCurrency}`);
    }
    const rateBetweenCurrencies = ratesDoc[toCurrency] / ratesDoc[fromCurrency];
    // for sats, return rounded number
    const finalRate = value * rateBetweenCurrencies;
    if (toCurrency === "SAT") {
        return Math.round(finalRate);
    }
    // otherwise return 2 decimal points
    return Math.round((finalRate + Number.EPSILON) * 100) / 100;
}
exports.convertPrice = convertPrice;
//# sourceMappingURL=orders.js.map