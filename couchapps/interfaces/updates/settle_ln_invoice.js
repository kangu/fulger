function (doc, req) {
    if (!req.id) {
        return [null, 'Missing order id'];
    }
    /* receives as post data the full lnd invoice data */
    var input = {};
    try {
        input = JSON.parse(req.body);
    } catch (e) {
        return [null, 'Missing body'];
    }

    /* mark as settled true */
    if (input['settled']) {
        doc.settled = true;
        doc.ln_invoice_settled_at = new Date(parseInt(input['settle_date']) * 1000).toISOString()
        return [doc, JSON.stringify({success: true})];
    }
    return [null, 'Invoice not modified']
}
