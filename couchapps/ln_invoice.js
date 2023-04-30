/*
    Expect .env parameters from top level file
    COUCH
    COUCH_PASS
    DB_NAME
* */

const path = require("path")
require('dotenv').config({path: path.join(__dirname, '../.env')})

const Couch = require( "../dist/api/couch").default
const c = new Couch(process.env.COUCH, process.env.COUCH_PASS)
c.setBase64Token(process.env.COUCH_PASS)

const sourceDoc = {
    _id: "_design/ln_invoice",
    language: "javascript",
    filters: {
        LN_Invoice: function (doc, req) {
            /* allow through invoices that have not been resolved yet */
            if ((doc.LN_Invoice === true) && (!doc.ln_invoice_req)) {
                return true
            }
            /* for everything else just basically ignore */
            return false
        }
    },
    updates: {
        settle_ln_invoice: function (doc, req) {
            if (!req.id) {
                return [null, 'Missing order id'];
            }
            /* receives as post data the full lnd invoice data */
            var input = {};
            try {
                input = JSON.parse(req.body);
            } catch (e) {
                return [null, 'Missing body'];
            }

            /* mark as settled true */
            if (input['settled']) {
                doc.settled = true;
                doc.ln_invoice_settled_at = new Date(parseInt(input['settle_date']) * 1000).toISOString()
                return [doc, JSON.stringify({success: true})];
            }
            return [null, 'Invoice not modified']
        }
    },
    validate_doc_update: function (newDoc, oldDoc, userCtx) {
        if (typeof newDoc.LN_Invoice !== "undefined") {
            if (typeof newDoc.ln_invoice_sats !== "number") { throw({forbidden: "Must have sats amount"}) }
            if (oldDoc && oldDoc.ln_invoice_sats && (oldDoc.ln_invoice_sats !== newDoc.ln_invoice_sats)) { throw({forbidden: "Cannot change amount"}) }
        }
        return true
    }

}

c.createDatabase(process.env.DB_NAME)
    .then(() => {
        c.saveDocument(process.env.DB_NAME, c.compileValidDesignDoc(sourceDoc), true)
            .then(resp => {
                console.log("Successful save", sourceDoc._id)
            })
    })
