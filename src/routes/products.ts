const Joi = require("joi")
import {Request, ResponseToolkit, Server} from "@hapi/hapi"
import {createProduct, getProduct, deleteProduct, IProductAddRequest} from "../api/products"

const register = async (server: Server): Promise<void> => {
    try {

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
            handler: async (request: Request, h: ResponseToolkit) => {
                const input = <IProductAddRequest>request.payload
                const product = await createProduct(input)
                if (!product) {
                    return h.response({error: "Error creating product"}).code(400)
                }
                return h.response({ok: true}).code(201)
            }
        })

        server.route({
            method: "DELETE",
            path: "/products/{name}",
            handler: async (request: Request, h: ResponseToolkit) => {
                const product = await getProduct(request.params.name)
                if (product === null) {
                    return h.response({error: "Product not found"}).code(400)
                }
                const isDeleted = await deleteProduct(product)
                if (!isDeleted) {
                    return h.response({error: "Deletion failed"}).code(400)
                }
                return h.response({ok: true}).code(201)
            }
        })

        server.route({
            method: "GET",
            path: "/products/{name}",
            handler: async (request: Request, h: ResponseToolkit) => {
                const product = await getProduct(request.params.name)
                if (product === null) {
                    return h.response({error: "Product not found"}).code(400)
                }
                return h.response(product).code(200)
            }
        })

    } catch (err) {
        console.log(`Error registering orders plugin: ${err}`)
        throw err
    }
}

exports.plugin = {
    pkg: require("../../package.json"),
    name: "ZapProductsPlugin",
    register
}
