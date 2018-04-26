let service = (() => {

    function getActiveReceipt() {
        let userId = sessionStorage.getItem('userId');
        return requester.get('appdata', `receipts?query={"_acl.creator":"${userId}","active":"true"}`, 'Kinvey');
    }

    function getEntriesByReceiptId(receiptId) {
        return requester.get('appdata', `entries?query={"receiptId":"${receiptId}"}`, 'Kinvey');
    }

    function createEmptyReceipt() {
        let receipt = {
            "active": true,
            "productCount": 0,
            "total": 0
        };
        return requester.post('appdata', 'receipts', receipt, 'kinvey');
    }

    function addEntry(type, qty, price, receiptId) {
        let entry = {
            type,
            qty,
            price,
            receiptId
        };
        return requester.post('appdata', 'entries', entry, 'kinvey');
    }

    function deleteEntry(entryId) {
        return requester.remove('appdata', `entries/${entryId}`, 'kinvey');
    }

    function getMyReceipts() {
      
        let userId = sessionStorage.getItem('userId');
        return requester.get('appdata', `receipts?query={"_acl.creator":"${userId}","active":"false"}`, 'Kinvey');
    }

    function getReceiptDetails(receiptId) {
        return requester.get('appdata', `receipts/${receiptId}`, 'kinvey');
    }

    function commitReceipt(receiptId, productCount, total) {
        let receipt = {
            "active": false,
            productCount,
            total
        };
        return requester.update('appdata', `receipts/${receiptId}`,receipt, 'kinvey');
    }

    return {
        getActiveReceipt,
        getEntriesByReceiptId,
        createEmptyReceipt,
        addEntry,
        deleteEntry,
        getMyReceipts,
        getReceiptDetails,
        commitReceipt
    };
})();