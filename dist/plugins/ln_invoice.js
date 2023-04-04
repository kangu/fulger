"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LN_InvoicePlugin = {
    transform(obj) {
        let result = obj;
        if (result.pay_with_legacy_fiat) {
            // if paying with fiat, just skip the whole invoice
            return result;
        }
        result.LN_Invoice = true;
        result.ln_invoice_sats = result.sats_total;
        result.ln_invoice_expire_ms = 1000 * 60 * 60 * 24; // default to 24h
        return result;
    }
};
module.exports = LN_InvoicePlugin;
//# sourceMappingURL=ln_invoice.js.map