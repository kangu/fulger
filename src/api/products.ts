const axios = require("axios")
axios.defaults.headers.common["Authorization"] = `Basic ${process.env.COUCH_PASS}`
axios.defaults.headers.common["Accept-Encoding"] = "application/json"

export interface IProduct {
    _id: string
    name: string
    price: number
    price_currency: string
}

export interface IProductAddRequest {
    name: string
    price: number
    price_currency: string
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

export async function getProducts(names: string[]): Promise<[products: IProduct[], error: string]> {
    const validNames = names.map(item => `product:${item}`)
    const response = await axios.get(
        `${DB_ENDPOINT}/_all_docs`,
        {
            params: {
                include_docs: true,
                keys: `["${validNames.join("\",\"")}"]`
            }
        }
    )

    // iterate response and if docs are not found, return error
    const errors: string[] = []
    for (let i = 0; i < response.data.rows.length; i++) {
        if (typeof response.data.rows[i].doc === 'undefined') {
            errors.push(names[i])
        }
    }
    if (errors.length) {
        return [null, "Missing products: " + errors.join("\"")]
    }

    return [<IProduct[]>response.data.rows.map(item => item.doc), null]
}

export async function createProduct(req: IProductAddRequest): Promise<boolean> {
    try {
        const product: IProduct = {
            _id: `product:${req.name}`,
            name: req.name,
            price: req.price,
            price_currency: req.price_currency
        }
        await axios.post(
            DB_ENDPOINT,
            product
        )
        // console.log('Product creation', response.data)
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
        // console.log('Product deletion', response.data)
        return true
    } catch (e) {
        console.log('Error deleting product', e.message)
        return false
    }
}
