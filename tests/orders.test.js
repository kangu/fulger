const axios = require("axios")
import {convertPrice} from "../dist/api/orders"
import Couch from "../dist/api/couch"

describe("Order management", () => {

    let couch = new Couch()

    const TEST_PRODUCT1 = {
        name: "Test product 1",
        price: 5,
        price_currency: "EUR"
    }

    const TEST_PRODUCT2 = {
        name: "Product sold in sats",
        price: 5,
        price_currency: "SAT"
    }

    // supply fixed rates as well
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

    beforeAll(() => {
        return Promise.all([
            axios.post("http://localhost:9994/products", TEST_PRODUCT1),
            axios.post("http://localhost:9994/products", TEST_PRODUCT2),
            couch.saveDocument("zap", TEST_RATES),
            couch.saveDocument("zap", TEST_SETTINGS)
        ])
    })

    afterAll(() => {
        return Promise.all([
            axios.delete("http://localhost:9994/products/" + TEST_PRODUCT1.name),
            axios.delete("http://localhost:9994/products/" + TEST_PRODUCT2.name),
            couch.deleteDocument("zap", TEST_RATES._id),
            couch.deleteDocument("zap", TEST_SETTINGS._id)
        ])
    })

    it("should fail when a non-existing product is passed", async () => {
        const response = await axios.post(
            'http://localhost:9994/orders',
            {
                products: [
                    {"id": "Not-existing"}
                ]
            },
            {
                validateStatus: () => true
            }
        )
        expect(response.status).toEqual(400)
    })

    it("should create an order when a valid product is passed", async () => {
        const response = await axios.post(
            'http://localhost:9994/orders',
            {
                products: [
                    {id: TEST_PRODUCT1.name, quantity: 1}
                ],
                currency: "SAT",
                env: {
                    RATES_DOC: TEST_RATES._id
                },
                immediate: true
            }
        )
        expect(response.status).toEqual(201)
        // expect to equal IOrder
    })

    it("should calculate correct price when using same-currency", async () => {
        const response = await axios.post(
            'http://localhost:9994/orders',
            {
                products: [
                    {id: TEST_PRODUCT1.name, quantity: 2}
                ],
                currency: "EUR",
                env: {
                    RATES_DOC: TEST_RATES._id
                },
                immediate: true
            }
        )
        expect(response.data).toEqual(
            expect.objectContaining({
                order_currency: "EUR",
                order_total: 10
            })
        )
    })

    it("should calculate correct price when using different", async () => {
        const response = await axios.post(
            'http://localhost:9994/orders',
            {
                products: [
                    {id: TEST_PRODUCT1.name, quantity: 2}
                ],
                currency: "RON",
                env: {
                    RATES_DOC: TEST_RATES._id
                },
                immediate: true
            }
        )
        expect(response.data).toEqual(
            expect.objectContaining({
                order_currency: "RON",
                order_total: 40
            })
        )
    })

    it("should calculate base price in fiat needed for accounting", async () => {
        const response = await axios.post(
            'http://localhost:9994/orders',
            {
                products: [
                    {id: TEST_PRODUCT1.name, quantity: 2}
                ],
                currency: "RON",
                env: {
                    RATES_DOC: TEST_RATES._id,
                    SETTINGS_DOC: TEST_SETTINGS._id
                },
                immediate: true,
                pay_with_legacy_fiat: true
            }
        )
        expect(response.data).toEqual(
            expect.objectContaining({
                fiat_currency: "USD",
                fiat_total: 12
            })
        )
    })

    it("should generate LN invoice", async () => {
        const response = await axios.post(
            'http://localhost:9994/orders',
            {
                products: [
                    {id: TEST_PRODUCT1.name, quantity: 2}
                ],
                currency: "RON",
                env: {
                    RATES_DOC: TEST_RATES._id,
                    SETTINGS_DOC: TEST_SETTINGS._id
                }
            }
        )
        expect(response.data).toHaveProperty('ln_invoice_req')
    })

    it("should produce an order coming in directly in sats", async () => {
        const response = await axios.post(
            'http://localhost:9994/orders',
            {
                products: [
                    {id: TEST_PRODUCT2.name, quantity: 1}
                ],
                currency: "SAT",
                env: {
                    RATES_DOC: TEST_RATES._id,
                    SETTINGS_DOC: TEST_SETTINGS._id
                }
            }
        )
        expect(response.data).toHaveProperty('ln_invoice_req')
        expect(response.data.fiat_total).toEqual(0.1)
    })

})

describe("Currency conversion", () => {

    const TEST_RATES = {
        _id: "rate:Test",
        SAT: 10000,
        EUR: 2.49,
        RON: 12.48
    }

    const SIMPLER_RATES = {
        _id: "rate:Test",
        EUR: 2.5,
        RON: 10,
        USD: 3,
        SAT: 10000
    }

    it("should throw error when missing currency pair", () => {
        let errorMessage = null
        try {
            convertPrice(25, "EUR", "USD", TEST_RATES)
        } catch (e) {
            errorMessage = e.message
        }
        expect(errorMessage).not.toBeNull()
    })

    it("should convert from euros to sats", () => {
        const price = convertPrice(10, "EUR", "SAT", TEST_RATES)
        expect(price).toEqual(40161)
    })

    it("should convert from euros to ron", () => {
        const price = convertPrice(10, "EUR", "RON", TEST_RATES)
        expect(price).toEqual(50.12)
    })

    it("should round fiat to 1 decimal when converting from just few sats", () => {
        const price = convertPrice(5, "SAT", "USD", SIMPLER_RATES)
        expect(price).toEqual(0.01)
    })

})
