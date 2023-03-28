function (newDoc, oldDoc, userCtx) {
   if (typeof newDoc.LN_Invoice !== "undefined") {
       if (typeof newDoc.ln_invoice_sats !== "number") { throw({forbidden: "Must have sats amount"}) }
       if (oldDoc && oldDoc.ln_invoice_sats && (oldDoc.ln_invoice_sats !== newDoc.ln_invoice_sats)) { throw({forbidden: "Cannot change amount"}) }
   }
   return true
}
