/*
*
*   Rates are always referenced to 10.000 sats
*
* */

const path = require("path")
const axios = require("axios")
const Couch = require( "../dist/api/couch").default
require('dotenv').config({path: path.join(__dirname, '../.env')})

const c = new Couch(process.env.COUCH, process.env.COUCH_PASS)
c.setBase64Token(process.env.COUCH_PASS)

const PRICE_ENDPOINT = 'https://rest.coinapi.io/v1/exchangerate/BTC?filter_asset_id=' + process.env.CURRENCIES

async function getRateFromAPIProvider() {
    const { data } = await axios.get(PRICE_ENDPOINT, {
        headers: {
            'X-CoinAPI-Key': process.env.API_KEY_COINAPI
        }
    })
    console.log('Data', data)

    const timestamp = new Date().toISOString()

    /* build new rates doc */
    const newDoc = {
        _id: process.env.RATES_DOC,
        timestamp,
        SAT: 10000
    }

    /* data.rates is present on the api response */
    data.rates.forEach(rate => {
        newDoc[rate.asset_id_quote] = parseFloat((rate.rate / 10000).toFixed(2))
    })

    /* archive existing rates doc */
    try {
        const existingDoc = await c.getDocument(process.env.DB_NAME, process.env.RATES_DOC)
        newDoc._rev = existingDoc._rev

        delete existingDoc._rev
        existingDoc._id = timestamp
        // should handle cases where DB_RATES_ARCHIVE is not present
        await c.createDatabase(process.env.DB_RATES_ARCHIVE)
        await c.saveDocument(process.env.DB_RATES_ARCHIVE, existingDoc)
    } catch (e) {
        // existing doc could not be saved
        console.log("Cannot save existing rate", e.message)
    }

    /* persist latest version of rates doc */
    await c.saveDocument(process.env.DB_NAME, newDoc)
    console.log('new doc saved', newDoc)
}

/* bootstrap everything */
const initBlock = new Promise(async (resolve, reject) => {
    await getRateFromAPIProvider()
})
