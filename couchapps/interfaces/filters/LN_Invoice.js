function (doc, req) {
    if (doc.LN_Invoice === true) {
        return true
    }
    /* for everything else just basically ignore */
    return false
}
