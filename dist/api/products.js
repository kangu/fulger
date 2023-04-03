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
exports.deleteProduct = exports.createProduct = exports.getProducts = exports.getProduct = void 0;
const axios = require("axios");
axios.defaults.headers.common["Authorization"] = `Basic ${process.env.COUCH_PASS}`;
axios.defaults.headers.common["Accept-Encoding"] = "application/json";
const DB_ENDPOINT = `${process.env.COUCH}/${process.env.DB_NAME}`;
function getProduct(name) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios.get(`${DB_ENDPOINT}/product:${name}`);
            return response.data;
        }
        catch (e) {
            console.log('Error looking up product', name, e.message);
            return null;
        }
    });
}
exports.getProduct = getProduct;
function getProducts(names) {
    return __awaiter(this, void 0, void 0, function* () {
        const validNames = names.map(item => `product:${item}`);
        const response = yield axios.get(`${DB_ENDPOINT}/_all_docs`, {
            params: {
                include_docs: true,
                keys: `["${validNames.join("\",\"")}"]`
            }
        });
        // iterate response and if docs are not found, return error
        const errors = [];
        for (let i = 0; i < response.data.rows.length; i++) {
            if (typeof response.data.rows[i].doc === 'undefined') {
                errors.push(names[i]);
            }
        }
        if (errors.length) {
            return [null, "Missing products: " + errors.join("\"")];
        }
        return [response.data.rows.map(item => item.doc), null];
    });
}
exports.getProducts = getProducts;
function createProduct(req) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const product = {
                _id: `product:${req.name}`,
                name: req.name,
                price: req.price,
                price_currency: req.price_currency
            };
            yield axios.post(DB_ENDPOINT, product);
            // console.log('Product creation', response.data)
            return true;
        }
        catch (e) {
            console.log('Error creating product', name, e.message);
            return false;
        }
    });
}
exports.createProduct = createProduct;
function deleteProduct(product) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios.post(DB_ENDPOINT, Object.assign(Object.assign({}, product), { _deleted: true }));
            // console.log('Product deletion', response.data)
            return true;
        }
        catch (e) {
            console.log('Error deleting product', e.message);
            return false;
        }
    });
}
exports.deleteProduct = deleteProduct;
//# sourceMappingURL=products.js.map