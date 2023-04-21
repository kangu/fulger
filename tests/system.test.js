const axios = require("axios")

// import from /dist to test the final output
import {getOneSATPrice} from "../dist/api/orders"
import Couch from "../dist/api/couch"

describe("System tests", () => {

    let couch = new Couch(process.env.COUCH, process.env.COUCH_PASS)

    it("should have access to the env variables", () => {
        expect(process.env.COUCH).toBeDefined()
    })

    it("should have access to couch instance", async () => {
        const response = await axios.get(
            process.env.COUCH
        )
        expect(response.data).toEqual(
            expect.objectContaining({couchdb: "Welcome"})
        )
    })

    it("should run the API server", async () => {
        const response = await axios.get(
            'http://localhost:9994'
        )
        expect(response.data).toEqual(
            expect.objectContaining({ok: true})
        )
    })

    it("should have access to the internal API methods", () => {
        expect(typeof getOneSATPrice).toEqual("function")
    })

    it("should access the couch ln interface", async () => {
        // expect _design/interfaces doc to be loaded onto the couch
        const doc = await couch.getDocument("_design/ln_invoice")
        expect(doc._id).toEqual("_design/ln_invoice")
    })

})
