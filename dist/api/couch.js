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
class Couch {
    saveDocument(db, doc) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.post(`${DB_ENDPOINT}`, doc);
                return response.data;
            }
            catch (e) {
                console.log('Error saving document', doc['_id'], e.message);
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