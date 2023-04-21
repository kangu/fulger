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
// this should be removed
const DB_ENDPOINT = `${process.env.COUCH}/${process.env.DB_NAME}`;
// Recursively transform an object into a JSON compatible representation
// and preserve methods by calling toString() on the function objects.
function objToJson(obj) {
    return Object.keys(obj).reduce(function (memo, key) {
        if (typeof obj[key] === 'function') {
            memo[key] = obj[key].toString();
        }
        else if (typeof obj[key] === 'object' && !Array.isArray(obj[key]) && obj[key] !== null) {
            memo[key] = objToJson(obj[key]);
        }
        else {
            memo[key] = obj[key];
        }
        return memo;
    }, {});
}
class Couch {
    constructor(couchUrl, adminBase64Password) {
        this._couchUrl = couchUrl;
        this._adminBase64Password = adminBase64Password;
    }
    buildLoginHeader() {
        const headers = {};
        if (this._base64Login) {
            headers['Authorization'] = `Basic ${this._base64Login}`;
        }
        return headers;
    }
    /*
    * Public interface
    * */
    setBase64Token(token) {
        this._base64Login = token;
    }
    compileValidDesignDoc(doc) {
        return objToJson(doc);
    }
    saveDocument(db, doc, overwrite) {
        return __awaiter(this, void 0, void 0, function* () {
            if (overwrite) {
                // try to get revision of existing document
                const existingRev = yield this.getDocumentRevision(db, doc['_id']);
                if (existingRev) {
                    doc['_rev'] = existingRev;
                }
            }
            try {
                const response = yield axios_1.default.post(
                // `${DB_ENDPOINT}`,
                `${this._couchUrl}/${encodeURIComponent(db)}`, doc, {
                    headers: this.buildLoginHeader()
                });
                return response.data;
            }
            catch (e) {
                console.log('Error saving document', doc['_id'], e.message);
                return null;
            }
        });
    }
    saveBulk(db, docs) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data } = yield axios_1.default.post(`${this._couchUrl}/${encodeURIComponent(db)}/_bulk_docs`, { docs }, {
                    headers: this.buildLoginHeader()
                });
                return data;
            }
            catch (e) {
                console.log('Error saving bulk documents', db, e.message);
                return [];
            }
        });
    }
    getDocumentRevision(db, id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.head(
                // `${DB_ENDPOINT}`,
                `${this._couchUrl}/${encodeURIComponent(db)}/${encodeURIComponent(id)}`, {
                    headers: this.buildLoginHeader()
                });
                return response.headers['etag'].replace(/['"]+/g, '');
            }
            catch (e) {
                console.log('Error getting document revision', id, e.message);
                return null;
            }
        });
    }
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
                const response = yield axios_1.default.get(`${DB_ENDPOINT}/${process.env.SETTINGS_DOC}`);
                return response.data;
            }
            catch (e) {
                console.log('Error loading settings', e.message);
                return null;
            }
        });
    }
    deleteDocument(db, id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.head(`${process.env.COUCH}/${db}/${id}`);
                // remove quotes from header since they are present
                const rev = response.headers['etag'].replace(/^"(.*)"$/, '$1');
                // console.log('Found doc rev for delete', rev)
                const responseDelete = yield axios_1.default.delete(`${process.env.COUCH}/${db}/${id}`, {
                    params: { rev }
                });
                // console.log('Delete data', responseDelete.data, responseDelete.data.ok === true)
                return (responseDelete.data.ok === true);
            }
            catch (e) {
                console.log(`Error deleting document ${id}`, e.message);
                return false;
            }
        });
    }
}
exports.default = Couch;
//# sourceMappingURL=couch.js.map