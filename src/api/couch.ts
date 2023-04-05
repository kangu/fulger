import axios from "axios"
// axios.defaults.headers.common["Authorization"] = `Basic ${process.env.COUCH_PASS}`
// axios.defaults.headers.common["Accept-Encoding"] = "application/json"

interface ICouch {
    getDocument(id: string): Promise<object>,
    saveDocument(db: string, doc: object): Promise<object>
    deleteDocument(db: string, id: string): Promise<boolean>
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

const DB_ENDPOINT = `${process.env.COUCH}/${process.env.DB_NAME}`

class Couch implements ICouch {

    async saveDocument(db: string, doc: object): Promise<ICouchDocCreation> {
        try {
            const response = await axios.post(
                `${DB_ENDPOINT}`,
                doc
            )
            return response.data
        } catch (e) {
            console.log('Error saving document', doc['_id'], e.message)
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
