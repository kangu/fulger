const Joi = require("joi")
import {Request, ResponseToolkit, Server} from "@hapi/hapi"
// import {getProduct} from "../api/products"
import {IOrderRequest, generateOrder} from "../api/orders"
import Couch from "../api/couch"
import {ISettings} from "../api/settings"
import PluginManager from "../plugin_manager"

/* initialize plugins from env file */
const pluginNames = process.env.PLUGINS.split(',')
const pluginManager = new PluginManager()
for (const pluginName of pluginNames) {
    pluginManager.loadPlugin(pluginName)
}

const register = async (server: Server): Promise<void> => {
    let couch = new Couch()

    // load available plugins running on the order generation queue

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
                        products: Joi.array(),
                        currency: Joi.string()
                    })
                }
            },
            handler: async (request: Request, h: ResponseToolkit) => {
                const input = <IOrderRequest>request.payload
                try {
                    const settings = await couch.getApplicationSettings()
                    const rates: object = await couch.getDocument(process.env.RATES_DOC)
                    const order = await generateOrder(input, <ISettings>settings, rates)
                    // pass order through associated plugins
                    const processedOrder = pluginManager.runTransformations(order)
                    // save order to couch
                    // wait for external watcher to pick up and write down lnbc code
                    // generate qr code image and attach to document
                    return h.response(processedOrder).code(201)
                } catch (e) {
                    return h.response({error: e.message}).code(400)
                }
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
