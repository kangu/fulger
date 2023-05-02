const Joi = require("joi")
import {Request, ResponseToolkit, Server} from "@hapi/hapi"
// import {getProduct} from "../api/products"
import {generateOrder, generateTip} from "../api/orders"
import {IOrder, IOrderRequest, ITipRequest} from "../models/order"
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
    let couch = new Couch(process.env.COUCH, "")

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
            method: "GET",
            path: "/rates",
            handler: async (request: Request, h: ResponseToolkit) => {
                return await couch.getDocument(process.env.DB_NAME, process.env.RATES_DOC)
            }
        })

        server.route({
            method: "POST",
            path: "/tip",
            options: {
                validate: {
                    payload: Joi.object({
                        currency: Joi.string(),
                        value: Joi.number(),
                        // value: Joi.alternatives().try(
                        //     Joi.string(),
                        //     Joi.number()
                        // ),
                        immediate: Joi.boolean().optional(),
                        env: Joi.object().optional()
                    })
                }
            },
            handler: async (request: Request, h: ResponseToolkit) => {
                const input = <ITipRequest>request.payload
                const settings = await couch.getDocument(process.env.DB_NAME, (input.env && input.env['SETTINGS_DOC'] ? input.env['SETTINGS_DOC'] : process.env.SETTINGS_DOC))
                console.log('Input to order 1', settings)
                const rates: object = await couch.getDocument(process.env.DB_NAME, (input.env && input.env['RATES_DOC'] ? input.env['RATES_DOC'] : process.env.RATES_DOC))
                console.log('Input to order 2', settings, rates)
                const order = await generateTip(input, <ISettings>settings, rates)

                const processedOrder = <IOrder>pluginManager.runTransformations(order)

                // mark as test if custom env has been passed
                processedOrder.test = (typeof input.env === "object")

                // save order to couch
                const saveResult: ICouchDocCreation = await couch.saveDocument(process.env.DB_NAME, processedOrder)

                // wait for 1.5 seconds
                if (!input.immediate) {
                    await new Promise((resolve) => setTimeout(resolve, 4000));
                    // in case of external watcher picks up and updates the document
                }

                // read again the document id
                // might not want to return the full object but a filtered down one
                const persistedDoc = await couch.getDocument(process.env.DB_NAME, processedOrder._id)
                // finally return id
                // console.log("Order doc persisted", persistedDoc)

                return h.response(persistedDoc).code(201)
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
                        pay_with_legacy_fiat: Joi.boolean().optional(),
                        /* test environment object for debugging, marks an immutable test=true on the doc */
                        env: Joi.object().optional(),
                        immediate: Joi.boolean().optional()
                    })
                }
            },
            handler: async (request: Request, h: ResponseToolkit) => {
                const input = <IOrderRequest>request.payload
                try {
                    console.log('Handling order')
                    const settings = await couch.getDocument(process.env.DB_NAME, (input.env && input.env['SETTINGS_DOC'] ? input.env['SETTINGS_DOC'] : process.env.SETTINGS_DOC))
                    console.log('Input to order 1', settings)
                    const rates: object = await couch.getDocument(process.env.DB_NAME, (input.env && input.env['RATES_DOC'] ? input.env['RATES_DOC'] : process.env.RATES_DOC))
                    console.log('Input to order 2', settings, rates)
                    const order = await generateOrder(input, <ISettings>settings, rates)
                    console.log('Input to order 3', settings, rates, order)

                    // pass order through associated plugins
                    const processedOrder = <IOrder>pluginManager.runTransformations(order)

                    // mark as test if custom env has been passed
                    processedOrder.test = (typeof input.env === "object")

                    // save order to couch
                    const saveResult: ICouchDocCreation = await couch.saveDocument(process.env.DB_NAME, processedOrder)

                    // wait for 1.5 seconds
                    if (!input.immediate) {
                        await new Promise((resolve) => setTimeout(resolve, 4000));
                        // in case of external watcher picks up and updates the document
                    }

                    // read again the document id
                    // might not want to return the full object but a filtered down one
                    const persistedDoc = await couch.getDocument(process.env.DB_NAME, processedOrder._id)
                    // finally return id
                    // console.log("Order doc persisted", persistedDoc)

                    return h.response(persistedDoc).code(201)
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
