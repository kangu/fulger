function (newDoc, oldDoc, userCtx) {
   if (typeof newDoc.LN_Invoice !== "undefined") {
       if (typeof newDoc.ln_invoice_sats !== "number") { throw({forbidden: "Must have sats amount"}) }
   }
   return true
}
