/*
*       Watches the changes feed of a remote couch for the api-compatible lnurl paryments
*
*       Has a filter function to filter only documents confirming to the interface
*       with LN_Invoice = true, ln_invoice_sats, ln_invoice
* */

// tor service returns invalid ssl
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const axios = require("axios")
require('dotenv').config()
const request = require("tor-request")

async function init() {
    const queryConfig = {
        feed: "longpoll",
        timeout: 10000, // 10 seconds
        include_docs: true,
        filter: "interfaces/LN_Invoice"
    }
    let isStarted = true
    let lastSeq = null
    console.log('Starting watch on', process.env.COUCH)
    console.log('Remote lnd host', process.env.LND_ENDPOINT)

    while (isStarted) {
        // get changes feed
        try {
            let resp = await axios.get(`${process.env.COUCH}/zap/_changes`, {
                params: {
                    since: lastSeq || "now",
                    ...queryConfig
                },
                headers: {'Authorization': `Basic ${process.env.COUCH_PASS}`}
            })
            lastSeq = resp.data.last_seq
            if (resp.data.results.length) {
                // for the moment default to lnd
                // can be enabled later with ln_invoice_provider_ flags
                for (let i = 0; i < resp.data.results.length; i++) {
                    const doc = resp.data.results[i].doc

                    const updatedDoc = await processLnd(doc)
                    // generate and attach qr code

                    // persist right away
                    let respDoc = await axios.post(`${process.env.COUCH}/zap`,
                        updatedDoc,
                        {
                            headers: {'Authorization': `Basic ${process.env.COUCH_PASS}`}
                        })

                    console.log('Processed ln_invoice', respDoc.data['id'])
                }

            }
            // console.log(resp.data)
        } catch (e) {
            console.log("Error on changes feed", (e.response ? e.response.data : e.message))
        }
        // isStarted = false
        // console.log("Retrying changes feed since " + lastSeq.split('-')[0])
    }
}

/* Interface for connecting to LND instance */
async function processLnd(doc) {
    return new Promise(async (resolve, reject) => {
        let payload = {
            memo: doc.ln_invoice_memo,
            value: doc.ln_invoice_sats
        }
        try {
            // console.log('Querying lnd endpoint', payload, new Date().toISOString())
            request.request({
                url: process.env.LND_ENDPOINT,
                headers: {
                    'Grpc-Metadata-macaroon': process.env.LND_MAC,
                    'Content-Type': "application/json"
                },
                method: "POST",
                json: true,
                body: payload
            }, async (error, response, body) => {
                if (error) {
                    console.log("Got lnd error", error)
                    reject("LND error")
                } else {
                    console.log("Success lnd call", body)

                    // dump all data from invoice into doc
                    let respDoc = await axios.get(`${process.env.COUCH}/zap/${doc['_id']}`,
                        {
                            headers: {'Authorization': `Basic ${process.env.COUCH_PASS}`}
                        })

                    const finalDoc = respDoc.data
                    // copy just the payment request code for now
                    finalDoc.ln_invoice_req = body['payment_request']

                    resolve(finalDoc)
                }
            })

        } catch (e) {
            console.log("Invoice generation failed", e.message, (e.response ? e.response.data : null))
            reject("Error generating invoice")
        }
    })
}

/* bootstrap everything */
const initBlock = new Promise(async (resolve, reject) => {
    await init()
})

console.log("Starting LN_Invoice watcher module", initBlock)
