export interface IProduct {
    _id: string
}

async function getProduct(name: string): Promise<string> {
    return "product is " + name
}

export {
    getProduct
}
