function (doc, req) {
    /* allow through invoices that have not been resolved yet */
    if ((doc.LN_Invoice === true) && (!doc.ln_invoice_req)) {
        return true
    }
    /* for everything else just basically ignore */
    return false
}
