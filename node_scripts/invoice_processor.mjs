/*
*       Watches the changes feed of a remote couch for the api-compatible lnurl paryments
*
*       Has a filter function to filter only documents confirming to the interface
*       with LN_Invoice = true, ln_invoice_sats, ln_invoice
* */

import axios from "axios"
import "dotenv/config.js"

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
    while (isStarted) {
        // get changes feed
        try {
            let resp = await axios.get(`${process.env.COUCH}/zap/_changes`, {
                params: {
                    since: lastSeq || "now",
                    ...queryConfig
                },
                headers: {
                    'Authorization': `Basic ${process.env.COUCH_PASS}`
                }
            })
            lastSeq = resp.data.last_seq
            if (resp.data.results.length) {
                // for the moment default to lnd
                // can be enabled later with ln_invoice_provider_ flags
                for (let i = 0; i < resp.data.results.length; i++) {
                    const doc = resp.data.results[i].doc

                    const updatedDoc = await processLnd(doc)
                    // generate and attach qr code
                }

            }
            console.log(resp.data)
        } catch (e) {
            console.log("Error on changes feed", (e.response ? e.response.data : e.message))
        }
        // isStarted = false
        console.log("Retrying changes feed since " + lastSeq.split('-')[0])
    }
}

/* Interface for connecting to LND instance */
async function processLnd(doc) {
    let payload = {
        memo: doc.ln_invoice_memo,
        value: doc.ln_invoice_sats
    }
    try {
        const resp = await axios.post()
    } catch (e) {
        console.log("Error generating invoice", e.message, (e.response ? e.response.data : null))
    }
}

await init()
