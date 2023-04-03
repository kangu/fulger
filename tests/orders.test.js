const axios = require("axios")
import {convertPrice} from "../dist/api/orders"

describe("Order management", () => {

    const TEST_PRODUCT1 = {
        name: "Test product 1",
        price: 5,
        price_currency: "EUR"
    }

    beforeAll(() => {
        return Promise.all([
            axios.post("http://localhost:9994/products", TEST_PRODUCT1)
        ])
    })

    afterAll(() => {
        return Promise.all([
            axios.delete("http://localhost:9994/products/" + TEST_PRODUCT1.name)
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
                currency: "SAT"
            }
        )
        expect(response.status).toEqual(201)
        // expect to equal IOrder
    })

})

describe("Currency conversion", () => {

    const TEST_RATES = {
        _id: "rate:Test",
        SAT: 10000,
        EUR: 2.49,
        RON: 12.48
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

})
