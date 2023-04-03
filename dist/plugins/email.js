"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EmailPlugin = {
    transform(obj) {
        obj.process_by_email = true;
        return obj;
    }
};
module.exports = EmailPlugin;
//# sourceMappingURL=email.js.map