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
    let couch = new couch_1.default();
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
                        currency: Joi.string()
                    })
                }
            },
            handler: (request, h) => __awaiter(void 0, void 0, void 0, function* () {
                const input = request.payload;
                try {
                    const settings = yield couch.getApplicationSettings();
                    const rates = yield couch.getDocument(process.env.RATES_DOC);
                    const order = yield (0, orders_1.generateOrder)(input, settings, rates);
                    // pass order through associated plugins
                    const processedOrder = pluginManager.runTransformations(order);
                    // save order to couch
                    // wait for external watcher to pick up and write down lnbc code
                    // generate qr code image and attach to document
                    return h.response(processedOrder).code(201);
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