import axios from "axios"
// axios.defaults.headers.common["Authorization"] = `Basic ${process.env.COUCH_PASS}`
// axios.defaults.headers.common["Accept-Encoding"] = "application/json"

interface ICouch {
    getDocument(id: string): Promise<object>,
    getDocumentRevision(db: string, id: string): Promise<string>
    saveDocument(db: string, doc: object, overwrite?: boolean): Promise<object>
    saveBulk(db: string, docs: object[]): Promise<object[]>
    deleteDocument(db: string, id: string): Promise<boolean>
    setBase64Token(token: string)
    compileValidDesignDoc(doc: object)
}

export interface ICouchDoc {
    _id: string
    _rev?: string
    _attachments?: object
}

export interface ICouchDocCreation {
    ok: string
    id: string,
    rev: string
}

// this should be removed
const DB_ENDPOINT = `${process.env.COUCH}/${process.env.DB_NAME}`

// Recursively transform an object into a JSON compatible representation
// and preserve methods by calling toString() on the function objects.
function objToJson (obj) {
    return Object.keys(obj).reduce(function (memo, key) {
        if (typeof obj[key] === 'function') {
            memo[key] = obj[key].toString()
        } else if (typeof obj[key] === 'object' && !Array.isArray(obj[key]) && obj[key] !== null) {
            memo[key] = objToJson(obj[key])
        } else {
            memo[key] = obj[key]
        }

        return memo
    }, {})
}

class Couch implements ICouch {
    private _couchUrl: string;
    private _adminBase64Password: string;
    private _base64Login: string;

    constructor(couchUrl: string, adminBase64Password?: string) {
        this._couchUrl = couchUrl
        this._adminBase64Password = adminBase64Password;
    }

    private buildLoginHeader () {
        const headers = {}
        if (this._base64Login) {
            headers['Authorization'] = `Basic ${this._base64Login}`
        }
        return headers
    }

    /*
    * Public interface
    * */

    setBase64Token(token: string) {
        this._base64Login = token
    }

    compileValidDesignDoc(doc: object) {
        return objToJson(doc)
    }

    async saveDocument(db: string, doc: object, overwrite?: boolean): Promise<ICouchDocCreation> {
        if (overwrite) {
            // try to get revision of existing document
            const existingRev = await this.getDocumentRevision(db, doc['_id'])
            if (existingRev) {
                doc['_rev'] = existingRev
            }
        }
        try {
            const response = await axios.post(
                // `${DB_ENDPOINT}`,
                `${this._couchUrl}/${encodeURIComponent(db)}`,
                doc,
                {
                    headers: this.buildLoginHeader()
                }
            )
            return response.data
        } catch (e) {
            console.log('Error saving document', doc['_id'], e.message)
            return null
        }
    }

    async saveBulk(db: string, docs: object[]): Promise<object[]> {
        try {
            const { data } = await axios.post(
                `${this._couchUrl}/${encodeURIComponent(db)}/_bulk_docs`,
                {docs},
                {
                    headers: this.buildLoginHeader()
                }
            )
            return data
        } catch (e) {
            console.log('Error saving bulk documents', db, e.message)
            return []
        }
    }

    async getDocumentRevision(db: string, id: string): Promise<string> {
        try {
            const response = await axios.head(
                // `${DB_ENDPOINT}`,
                `${this._couchUrl}/${encodeURIComponent(db)}/${encodeURIComponent(id)}`,
                {
                    headers: this.buildLoginHeader()
                }
            )
            return response.headers['etag'].replace(/['"]+/g, '')
        } catch (e) {
            console.log('Error getting document revision', id, e.message)
            return null
        }
    }

    async getDocument(id: string): Promise<object> {
        try {
            const response = await axios.get(
                `${DB_ENDPOINT}/${id}`
            )
            return response.data
        } catch (e) {
            console.log('Error looking up document', id, e.message)
            return null
        }
    }

    async getApplicationSettings(): Promise<object> {
        try {
            const response = await axios.get(
                `${DB_ENDPOINT}/${process.env.SETTINGS_DOC}`
            )
            return response.data
        } catch (e) {
            console.log('Error loading settings', e.message)
            return null
        }
    }

    async deleteDocument(db: string, id: string): Promise<boolean> {
        try {
            const response = await axios.head(
                `${process.env.COUCH}/${db}/${id}`
            )
            // remove quotes from header since they are present
            const rev = response.headers['etag'].replace(/^"(.*)"$/, '$1')
            // console.log('Found doc rev for delete', rev)
            const responseDelete = await axios.delete(
                `${process.env.COUCH}/${db}/${id}`,
                {
                    params: { rev }
                }
            )
            // console.log('Delete data', responseDelete.data, responseDelete.data.ok === true)
            return (responseDelete.data.ok === true)
        } catch (e) {
            console.log(`Error deleting document ${id}`, e.message)
            return false
        }
    }

}

export default Couch
