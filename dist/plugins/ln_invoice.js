"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LN_InvoicePlugin = {
    transform(obj) {
        let result = obj;
        result.process_by_ln_invoice = true;
        return result;
    }
};
module.exports = LN_InvoicePlugin;
//# sourceMappingURL=ln_invoice.js.map