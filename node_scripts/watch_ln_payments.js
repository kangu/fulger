/*
*       Subscribes to the transactions feed from the lnd system and marks the orders
*       as settled in the destination couch
* */

// tor service returns invalid ssl
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const WebSocket = require('ws')
const axios = require("axios")
const path = require("path");
require('dotenv').config({path: path.join(__dirname, '../.env')})
const {SocksProxyAgent} = require('socks-proxy-agent')
const proxy = new SocksProxyAgent(`socks://127.0.0.1:9050`)

/* websocket instance */
let ws = null

// get all in the beginning
let requestBody = {
    add_index: 1,
    settle_index: 1
};

async function init() {
    console.log('Initializing socket on' + process.env.LND_ENDPOINT)
    ws = new WebSocket(`wss://${process.env.LND_ENDPOINT}/v1/invoices/subscribe?method=GET`, {
        // Work-around for self-signed certificates.
        rejectUnauthorized: false,
        headers: {
            'Grpc-Metadata-Macaroon': process.env.LND_MAC,
        },
        agent: proxy
    });
    ws.on('open', callbackOpenConnection)
    ws.on('error', callbackError)
    ws.on('message', callbackMessage)
}

function callbackOpenConnection() {
    // console.log('sending initial params', requestBody)
    ws.send(JSON.stringify(requestBody));
}

function callbackError(err) {
    // should retry the whole connection
    console.log('Got error', err)
    // reconnecting in 1s
    setTimeout(() => { init() }, 1000)
}

function callbackMessage(body) {
    const doc = JSON.parse(body.toString('utf8'))
    console.log('Received doc', doc)
    // check memo to see if matching an order from the system
    // for now orders all start with order-
    // in the future might want to consider having it as an option
    if (doc.result.memo.indexOf(process.env.ORDER_PREFIX) > -1) {
        // check if settled, otherwise ignore
        if (doc.result.settled) {
            markOrderAsSettled(doc.result)
        }
    }
}

function markOrderAsSettled(payload) {
    // make call to couch doc
    // update function that marks the settlement data
    // for now the document id in the couch matches the memo exactly
    axios.post(
        `${process.env.COUCH}${process.env.SETTLE_INVOICE_ENDPOINT}/${payload.memo}`,
        payload,
        {
            headers: {'Authorization': `Basic ${process.env.COUCH_PASS}`}
        }
    ).then(resp => {
        console.log('Settled invoice', resp.data)
    })
}

/* bootstrap everything */
const initBlock = new Promise(async (resolve, reject) => {
    await init()
})

console.log("Starting LN_Invoice watcher module", initBlock)
