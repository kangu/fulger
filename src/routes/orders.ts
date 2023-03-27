const Joi = require("joi")
import {Request, ResponseToolkit, Server} from "@hapi/hapi"
import {getProduct} from "../api/products"
import {IOrderRequest} from "../api/orders"

const register = async (server: Server): Promise<void> => {
    try {
        server.route({
            method: "GET",
            path: "/orders",
            handler: (request: Request, h: ResponseToolkit) => {
                return h.response({hello: 'orders'}).code(200)
            }
        })

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
            handler: async (request: Request, h: ResponseToolkit) => {
                const input = <IOrderRequest>request.payload
                const product = await getProduct(input.product)
                return h.response({hello: product}).code(200)
            }
        })
    } catch (err) {
        console.log(`Error registering orders plugin: ${err}`)
        throw err
    }
}

exports.plugin = {
    pkg: require("../../package.json"),
    name: "ZapOrdersPlugin",
    register
}
