const Joi = require("joi")
import {Request, ResponseToolkit, Server} from "@hapi/hapi"
// import {getProduct} from "../api/products"
import {IOrderRequest, IOrder, generateOrder} from "../api/orders"
import Couch, {ICouchDocCreation} from "../api/couch"
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
                        currency: Joi.string(),
                        pay_with_legacy_fiat: Joi.boolean().optional()
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
                    const processedOrder = <IOrder>pluginManager.runTransformations(order)
                    // save order to couch
                    const saveResult: ICouchDocCreation = await couch.saveDocument(process.env.DB_NAME, processedOrder)

                    // wait for 1.5 seconds
                    await new Promise((resolve) => setTimeout(resolve, 1500));
                    // in case of external watcher picks up and updates the document

                    // read again the document id
                    const persistedDoc = await couch.getDocument(processedOrder._id)
                    // finally return id
                    console.log("Order doc persisted", persistedDoc)

                    return h.response(saveResult).code(201)
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
