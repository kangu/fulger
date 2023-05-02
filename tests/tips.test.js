const axios = require("axios")
import Couch from "../dist/api/couch"
let couch = new Couch(process.env.COUCH, process.env.COUCH_PASS)
couch.setBase64Token(process.env.COUCH_PASS)

const TEST_RATES = {
    _id: "rate:Test",
    EUR: 2.5,
    RON: 10,
    USD: 3,
    SAT: 10000
}

const TEST_SETTINGS = {
    _id: "settings_test",
    currency: "USD"
}

function testSetup() {
    return Promise.all([
        couch.saveDocument("zap", TEST_RATES),
        couch.saveDocument("zap", TEST_SETTINGS)
    ])
}

function testTeardown() {
    return Promise.all([
        couch.deleteDocument("zap", TEST_RATES._id),
        couch.deleteDocument("zap", TEST_SETTINGS._id)
    ])
}

describe("Tips handling", () => {

    beforeAll(testSetup)
    afterAll(testTeardown)

    it("should allow a straight-up sats tip", async () => {
        const response = await axios.post(
            'http://localhost:9994/tip',
            {
                currency: "SAT",
                value: 10000,
                immediate: true
            }
        )
        expect(response.status).toEqual(201)
        expect(response.data).toEqual(
            expect.objectContaining({
                sats_total: 10000
            })
        )
    })

    it("should allow a default USD tip", async () => {
        const response = await axios.post(
            'http://localhost:9994/tip',
            {
                currency: "USD",
                value: 4,
                immediate: true,
                env: {
                    RATES_DOC: TEST_RATES._id,
                    SETTINGS_DOC: TEST_SETTINGS._id
                }
            }
        )
        expect(response.status).toEqual(201)
        expect(response.data).toEqual(
            expect.objectContaining({
                sats_total: 13333
            })
        )
    })

})
