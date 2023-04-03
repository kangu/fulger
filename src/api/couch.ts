import axios from "axios"
// axios.defaults.headers.common["Authorization"] = `Basic ${process.env.COUCH_PASS}`
// axios.defaults.headers.common["Accept-Encoding"] = "application/json"

interface ICouch {
    getDocument(id: string): Promise<object>
}

const DB_ENDPOINT = `${process.env.COUCH}/${process.env.DB_NAME}`
const SETTINGS_DOC = "settings"

class Couch implements ICouch {

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
                `${DB_ENDPOINT}/${SETTINGS_DOC}`
            )
            return response.data
        } catch (e) {
            console.log('Error loading settings', e.message)
            return null
        }
    }

}

export default Couch
