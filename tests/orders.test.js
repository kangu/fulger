const axios = require("axios")

describe("Order management", () => {

    const TEST_PRODUCT1 = {
        name: "Existing"
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
                product: 'Non-existing'
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
                product: 'Existing'
            }
        )
        expect(response.status).toEqual(201)
        // expect to equal IOrder
    })

})
