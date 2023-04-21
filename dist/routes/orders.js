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
const Joi = require("joi");
// import {getProduct} from "../api/products"
const orders_1 = require("../api/orders");
const couch_1 = require("../api/couch");
const plugin_manager_1 = require("../plugin_manager");
/* initialize plugins from env file */
const pluginNames = process.env.PLUGINS.split(',');
const pluginManager = new plugin_manager_1.default();
for (const pluginName of pluginNames) {
    pluginManager.loadPlugin(pluginName);
}
const register = (server) => __awaiter(void 0, void 0, void 0, function* () {
    let couch = new couch_1.default(process.env.COUCH, "");
    // load available plugins running on the order generation queue
    try {
        server.route({
            method: "GET",
            path: "/orders",
            handler: (request, h) => {
                return h.response({ hello: 'orders' }).code(200);
            }
        });
        server.route({
            method: "POST",
            path: "/orders",
            options: {
                validate: {
                    payload: Joi.object({
                        products: Joi.array(),
                        currency: Joi.string(),
                        pay_with_legacy_fiat: Joi.boolean().optional(),
                        /* test environment object for debugging, marks an immutable test=true on the doc */
                        env: Joi.object().optional(),
                        immediate: Joi.boolean().optional()
                    })
                }
            },
            handler: (request, h) => __awaiter(void 0, void 0, void 0, function* () {
                const input = request.payload;
                try {
                    console.log('Handling order');
                    const settings = yield couch.getDocument((input.env && input.env['SETTINGS_DOC'] ? input.env['SETTINGS_DOC'] : process.env.SETTINGS_DOC));
                    console.log('Input to order 1', settings);
                    const rates = yield couch.getDocument((input.env && input.env['RATES_DOC'] ? input.env['RATES_DOC'] : process.env.RATES_DOC));
                    console.log('Input to order 2', settings, rates);
                    const order = yield (0, orders_1.generateOrder)(input, settings, rates);
                    console.log('Input to order 3', settings, rates, order);
                    // pass order through associated plugins
                    const processedOrder = pluginManager.runTransformations(order);
                    // mark as test if custom env has been passed
                    processedOrder.test = (typeof input.env === "object");
                    // save order to couch
                    const saveResult = yield couch.saveDocument(process.env.DB_NAME, processedOrder);
                    // wait for 1.5 seconds
                    if (!input.immediate) {
                        yield new Promise((resolve) => setTimeout(resolve, 4000));
                        // in case of external watcher picks up and updates the document
                    }
                    // read again the document id
                    // might not want to return the full object but a filtered down one
                    const persistedDoc = yield couch.getDocument(processedOrder._id);
                    // finally return id
                    // console.log("Order doc persisted", persistedDoc)
                    return h.response(persistedDoc).code(201);
                }
                catch (e) {
                    return h.response({ error: e.message }).code(400);
                }
            })
        });
    }
    catch (err) {
        console.log(`Error registering orders plugin: ${err}`);
        throw err;
    }
});
exports.plugin = {
    pkg: require("../../package.json"),
    name: "ZapOrdersPlugin",
    register
};
//# sourceMappingURL=orders.js.map