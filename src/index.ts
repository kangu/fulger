require('dotenv').config()
import { Server, Request, ResponseToolkit } from "@hapi/hapi"

const init = async () => {
    const server: Server = new Server({
        port: process.env.SERVER_PORT || 9088,
        host: "localhost"
    })

    server.route({
        method: "GET",
        path: "/",
        handler: (request: Request, h: ResponseToolkit) => {
            return "Hello world"
        }
    })

    /* load all available route plugins */
    await server.register([
        require("./routes/orders")
    ])

    await server.start()
    console.log('Server running on %s', server.info.uri)
}

process.on("unhandledRejection", (err) => {
    console.log(err);
    process.exit(1);
})

init()
