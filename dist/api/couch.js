"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const DB_ENDPOINT = `${process.env.COUCH}/${process.env.DB_NAME}`;
const SETTINGS_DOC = "settings";
class Couch {
    getDocument(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.get(`${DB_ENDPOINT}/${id}`);
                return response.data;
            }
            catch (e) {
                console.log('Error looking up document', id, e.message);
                return null;
            }
        });
    }
    getApplicationSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.get(`${DB_ENDPOINT}/${SETTINGS_DOC}`);
                return response.data;
            }
            catch (e) {
                console.log('Error loading settings', e.message);
                return null;
            }
        });
    }
}
exports.default = Couch;
//# sourceMappingURL=couch.js.map