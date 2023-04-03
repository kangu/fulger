module.exports = function (newDoc, oldDoc, userCtx) {
    if (typeof newDoc.ln_invoice_sats !== "number") { throw new Error("Must have sats amount") }
    if (oldDoc && oldDoc.ln_invoice_sats && (oldDoc.ln_invoice_sats !== newDoc.ln_invoice_sats)) { throw new Error("Cannot change amount") }
}
