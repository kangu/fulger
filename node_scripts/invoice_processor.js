/*
*       Watches the changes feed of a remote couch for the api-compatible lnurl paryments
*
*       Has a filter function to filter only documents confirming to the interface
*       with LN_Invoice = true, ln_invoice_sats, ln_invoice
* */

// tor service returns invalid ssl
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const axios = require("axios")
const path = require("path");
require('dotenv').config({path: path.join(__dirname, '../.env')})
const QRCode = require("qrcode")
const {SocksProxyAgent} = require('socks-proxy-agent')

const proxy = new SocksProxyAgent(`socks://127.0.0.1:9050`)

async function init() {
    const queryConfig = {
        feed: "longpoll",
        timeout: 10000, // 10 seconds
        include_docs: true,
        filter: "ln_invoice/LN_Invoice"
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
                    console.log('Processing doc_id', doc._id)

                    const updatedDoc = await processLnd(doc)
                    // generate and attach qr code
                    try {
                        updatedDoc.ln_invoice_qr = await QRCode.toDataURL(updatedDoc['ln_invoice_req'])
                    } catch (e) {
                        console.log('Error generating QR for', doc._id)
                    }

                    // mark timestamp
                    updatedDoc.ln_invoice_created_at = new Date().toISOString()

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
    let payload = {
        memo: doc.ln_invoice_memo,
        value: doc.ln_invoice_sats
    }
    try {

        const { data } = await axios.post(`https://${process.env.LND_ENDPOINT}/v1/invoices`, payload, {
            httpsAgent: proxy,
            headers: {
                "Grpc-Metadata-macaroon": process.env.LND_MAC,
                "Content-Type": "application/json"
            }
        })

        // dump all data from invoice into doc
        let respDoc = await axios.get(`${process.env.COUCH}/zap/${doc['_id']}`,
            {
                headers: {'Authorization': `Basic ${process.env.COUCH_PASS}`}
            })

        const finalDoc = respDoc.data
        // copy just the payment request code for now
        finalDoc.ln_invoice_req = data['payment_request']

        return finalDoc

    } catch (e) {
        console.log("Invoice generation failed", e.message, (e.response ? e.response.data : null))
        // return doc that was originally passed
        return doc
    }
}

/* bootstrap everything */
const initBlock = new Promise(async (resolve, reject) => {
    await init()
})

console.log("Starting LN_Invoice watcher module", initBlock)
