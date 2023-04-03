var ln_invoice_specs = require("lib/validate/ln_invoice")

function (newDoc, oldDoc, userCtx) {
    if (typeof newDoc.LN_Invoice !== "undefined") {
        try {
            ln_invoice_specs(newDoc, oldDoc, userCtx)
        } catch (e) {
            throw({forbidden: e.message})
        }
    }
    return true
}
