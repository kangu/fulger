const path = require("path")
const Couch = require( "../dist/api/couch").default
require('dotenv').config({path: path.join(__dirname, '../.env')})
console.log('Couch url is', process.env.COUCH)

const c = new Couch(process.env.COUCH, process.env.COUCH_PASS)
c.setBase64Token(process.env.COUCH_PASS)

/*
*
*   The following docs will only be saved once as the default
*   further saves will result in a conflict and will not overwrite
*
* */

const docs = [
    {
        _id: "settings",
        currency: "EUR",
        enable_tips: true
    }
]

/* make sure the database exists */
c.createDatabase(process.env.DB_NAME)
    .then(() => {
        c.saveBulk(process.env.DB_NAME, docs)
            .then(resp => {
                console.log('Saved bulk', resp)
            })
    })
