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
            method: "POST",
            path: "/stores",
            handler: (request, h) => __awaiter(void 0, void 0, void 0, function* () { })
        });
        server.route({
            method: "GET",
            path: "/stores",
            handler: (request, h) => __awaiter(void 0, void 0, void 0, function* () { })
        });
        server.route({
            method: "POST",
            path: "/products",
            options: {
                validate: {
                    payload: Joi.object({
                        name: Joi.string(),
                        price: Joi.number(),
                        price_currency: Joi.string()
                    })
                }
            },
            handler: (request, h) => __awaiter(void 0, void 0, void 0, function* () {
                const input = request.payload;
                const product = yield (0, products_1.createProduct)(input);
                if (!product) {
                    return h.response({ error: "Error creating product" }).code(400);
                }
                return h.response({ ok: true }).code(201);
            })
        });
        server.route({
            method: "DELETE",
            path: "/products/{name}",
            handler: (request, h) => __awaiter(void 0, void 0, void 0, function* () {
                const product = yield (0, products_1.getProduct)(request.params.name);
                if (product === null) {
                    return h.response({ error: "Product not found" }).code(400);
                }
                const isDeleted = yield (0, products_1.deleteProduct)(product);
                if (!isDeleted) {
                    return h.response({ error: "Deletion failed" }).code(400);
                }
                return h.response({ ok: true }).code(201);
            })
        });
        server.route({
            method: "GET",
            path: "/products/{name}",
            handler: (request, h) => __awaiter(void 0, void 0, void 0, function* () {
                const product = yield (0, products_1.getProduct)(request.params.name);
                if (product === null) {
                    return h.response({ error: "Product not found" }).code(400);
                }
                return h.response(product).code(200);
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
    name: "ZapProductsPlugin",
    register
};
//# sourceMappingURL=products.js.map