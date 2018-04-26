let receipts = (() => {
    function getActiveReceipt() {
        let userId = sessionStorage.getItem('userId');
        return requester.get('appdata', `receipts?query={"_acl.creator":"${userId}","active":true}`, 'Kinvey');
    }

    function getEntriesByReceiptId(receiptId) {
        return requester.get('appdata', `entries?query={"receiptId":"${receiptId}"}`, 'Kinvey');
    }

    function createReceipt(productCount, total) {
        let active = true;
        let data = { active, productCount, total };
        return requester.post('appdata', 'receipts', data, 'kinvey');
    }

    function addEntry(type, qty, price, receiptId) {
        //to check is receipt active!!!
        let data = { type, qty, price, receiptId };
        return requester.post('appdata', 'entries', data, 'kinvey');
    }

    function deleteEntry(entry_id) {
        // can we delete from unactive receipt
        return requester.remove('appdata', `entries/${entry_id}`, 'kinvey');
    }

    function getMyReceipts() {
        let userId = sessionStorage.getItem('userId');
        return requester.get('appdata', `receipts?query={"_acl.creator":"${userId}","active":"false"}`, 'Kinvey');
    }

    function getReceiptDetails(receiptId) {
        return requester.get('appdata', `receipts/${receiptId}`, 'kinvey');

    }

    function checkout(receiptId) {
        
    }


    return {
        getActiveReceipt,
        getEntriesByReceiptId,
        createReceipt,
        checkout,
        getReceiptDetails,
        getMyReceipts,
        deleteEntry,
        addEntry
    };
})();