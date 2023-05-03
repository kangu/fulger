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
require('dotenv').config();
const hapi_1 = require("@hapi/hapi");
const H2o2 = require('@hapi/h2o2');
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    const server = new hapi_1.Server({
        port: process.env.SERVER_PORT || 9994,
        host: "localhost"
    });
    server.route({
        method: "GET",
        path: "/",
        handler: (request, h) => {
            return h.response({ ok: true, hello: "zappay" }).code(200);
        }
    });
    /* load proxy plugin */
    yield server.register(H2o2);
    /* load all available route plugins */
    yield server.register([
        require("./routes/orders"),
        require("./routes/products")
    ]);
    yield server.start();
    console.log('Server running on %s', server.info.uri);
});
process.on("unhandledRejection", (err) => {
    console.log(err);
    process.exit(1);
});
init();
//# sourceMappingURL=index.js.map