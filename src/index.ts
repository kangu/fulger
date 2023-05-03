require('dotenv').config()
import { Server, Request, ResponseToolkit } from "@hapi/hapi"
const H2o2 = require('@hapi/h2o2')

const init = async () => {
    const server: Server = new Server({
        port: process.env.SERVER_PORT || 9994,
        host: "localhost"
    })

    server.route({
        method: "GET",
        path: "/",
        handler: (request: Request, h: ResponseToolkit) => {
            return h.response({ok: true, hello: "zappay"}).code(200)
        }
    })

    /* load proxy plugin */
    await server.register(H2o2)

    /* load all available route plugins */
    await server.register([
        require("./routes/orders"),
        require("./routes/products")
    ])

    await server.start()
    console.log('Server running on %s', server.info.uri)
}

process.on("unhandledRejection", (err) => {
    console.log(err);
    process.exit(1);
})

init()
