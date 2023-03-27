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
const products_1 = require("../api/products");
const register = (server) => __awaiter(void 0, void 0, void 0, function* () {
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
                        product: Joi.string()
                    })
                }
            },
            handler: (request, h) => __awaiter(void 0, void 0, void 0, function* () {
                const input = request.payload;
                const product = yield (0, products_1.getProduct)(input.product);
                return h.response({ hello: product }).code(200);
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