const axios = require("axios")

describe("System tests", () => {

    it("should run couch on 5984", async () => {
        const response = await axios.get(
            'http://localhost:5984'
        )
        expect(response.data).toEqual(
            expect.objectContaining({couchdb: "Welcome"})
        )
    })

})
