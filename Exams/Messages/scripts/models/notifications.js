let notify = (() => {
    $(() => {
        let loading = 0;
        $(document).on({
            ajaxStart: () => {
                if (!loading) $('#loadingBox').fadeIn();
                loading++;
            },
            ajaxStop: () => setTimeout(() => {
                loading--;
                if (!loading) $('#loadingBox').fadeOut();
            }, 500)
        });

        $('#infoBox').toggle();
        $('#errorBox').toggle();
    });

    function showInfo(message) {
        $('#infoBox').find('span').text(message);
        $('#infoBox').fadeIn();
        setTimeout(() => $('#infoBox').fadeOut(), 3000);
    }

    function showError(message) {
        $('#errorBox').find('span').text(message);
        $('#errorBox').show();
        $('#errorBox').fadeIn();
    }

    function handleError(reason) {
        showError(reason.responseJSON.description);       
    }

    return {
        showInfo, showError, handleError
    };
})();