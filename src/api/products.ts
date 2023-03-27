const axios = require("axios")
axios.defaults.headers.common["Authorization"] = `Basic ${process.env.COUCH_PASS}`
axios.defaults.headers.common["Accept-Encoding"] = "application/json"

export interface IProduct {
    _id: string
    name: string
}

export interface IProductRequest {
    name: string
}

const DB_ENDPOINT = `${process.env.COUCH}/${process.env.DB_NAME}`

export async function getProduct(name: string): Promise<IProduct> {
    try {
        const response = await axios.get(
            `${DB_ENDPOINT}/product:${name}`
        )
        return <IProduct>response.data
    } catch (e) {
        console.log('Error looking up product', name, e.message)
        return null
    }
}

export async function createProduct(name: string): Promise<boolean> {
    try {
        const product: IProduct = {
            _id: `product:${name}`,
            name: name
        }
        const response = await axios.post(
            DB_ENDPOINT,
            product
        )
        console.log('Product creation', response.data)
        return true
    } catch (e) {
        console.log('Error creating product', name, e.message)
        return false
    }
}

export async function deleteProduct(product: IProduct): Promise<boolean> {
    try {
        const response = await axios.post(
            DB_ENDPOINT,
            { ...product, _deleted: true }
        )
        console.log('Product deletion', response.data)
        return true
    } catch (e) {
        console.log('Error deleting product', e.message)
        return false
    }
}
