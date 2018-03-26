function startApp() {

    $('header').find('a').show();
    //Navigation and headers

    function showView(view) {
        $('section').hide();
        switch (view) {
            case 'home':
                $('#viewHome').show();
                break;
            case 'login':
                $('#viewLogin').show();
                break;
            case 'register':
                $('#viewRegister').show();
                break;
            case 'ads':
                $('#viewAds').show();
                break;
            case 'create':
                $('#viewCreateAd').show();
                break;
            case 'details':
                $('#viewDetailsAd').show();
                break;
            case 'edit':
                $('#viewEditAd').show();
                break;

        }
    }

    function navigateTo(e) {
        $('section').hide();
        let target = $(e.target).attr('data-target');
        console.log(target);

        $('#' + target).show();
    }

    //Attach event listener
    $('header').find('a[data-target]').click(navigateTo);
    $('#buttonLoginUser').click(login);
    $('#buttonRegisterUser').click(register);
    $('#linkLogout').click(logout);
    


    //Notifications
    $(document).on({
        ajaxStart: () => $('#loadingBox').show(),
        ajaxStop: () => $('#loadingBox').fadeOut()
    });

    $('#infoBox').click((e) => $(e.target).hide());
    $('#errorBox').click((e) => $(e.target).hide());


    function showInfo(message) {
        $('#infoBox').text(message);
        $('#infoBox').show();
        setTimeout(() => $('#infoBox').fadeOut(), 3000);
    }

    function showError(message) {
        $('#errorBox').text(message);
        $('#errorBox').show();
    }

    function handleError(err) {
        showError(err.responseJSON.description);
    }

    //Session
    let requester = (() => {
        //Application settings
        const baseUrl = 'https://baas.kinvey.com/';
        const appKey = 'kid_HkeayCIqf';
        const appSecret = 'a499470dbfdf471d805a3abd80455038';

        function makeAuth(type) {
            if (type === 'basic') return 'Basic ' + btoa(appKey + ":" + appSecret);
            else return 'Kinvey ' + localStorage.getItem('authtoken');
        }

        function makeRequest(method, module, url, auth) {
            return {
                url: baseUrl + module + '/' + appKey + '/' + url,
                method,
                headers: {
                    'Authorization': makeAuth(auth)
                }
            };
        }

        function get(module, url, auth) {
            return $.ajax(makeRequest('GET', module, url, auth));
        }

        function post(module, url, data, auth) {
            let req = makeRequest('POST', module, url, auth);
            req.data = JSON.stringify(data);
            req.headers['Content-Type'] = 'application/json';
            return $.ajax(req);
        }

        function update(module, url, data, auth) {
            let req = makeRequest('PUT', module, url, auth);
            req.data = JSON.stringify(data);
            req.headers['Content-Type'] = 'application/json';
            return $.ajax(req);
        }

        function remove(module, url, data, auth) {
            return $.ajax(makeRequest('DELETE', module, url, auth));

        }

        return {
            get,
            post,
            update,
            remove
        };
    })();

    if (localStorage.getItem('authtoken') !== null && localStorage.getItem('username') !== null) {
        userLoggedIn();
    } else {
        userLoggedOut();
    }

    showView('home');

    function userLoggedIn() {
        $('#loggedInUser').text(`Welcome, ${localStorage.getItem('username')}!`);
        $('#loggedInUser').show();
        $('#linkLogin').hide();
        $('#linkRegister').hide();
        $('#linkLogout').show();
        $('#linkListAds').show();
        $('#linkCreateAd').show();

    }

    function userLoggedOut() {
        $('#loggedInUser').text(``);
        $('#loggedInUser').hide();
        $('#linkLogin').show();
        $('#linkRegister').show();
        $('#linkLogout').hide();
        $('#linkListAds').hide();
        $('#linkCreateAd').hide();

    }

    function saveSession(data) {
        localStorage.setItem('username', data.username);
        localStorage.setItem('id', data._id);
        localStorage.setItem('authtoken', data._kmd.authtoken);
        userLoggedIn();

    }

    async function login() {
        let form = $('#formLogin');
        let username = form.find('input[name="username"]').val();
        let password = form.find('input[name="passwd"]').val();
        try {
            let data = await requester.post('user', 'login', {
                username,
                password
            }, 'basic');
            saveSession(data);
            showView('ads');
        } catch (error) {
           handleError(error);
        }



    }

    async function register() {
        let form = $('#formRegister');
        let username = form.find('input[name="username"]').val();
        let password = form.find('input[name="passwd"]').val();
        try {
            let data = await requester.post('user', '', {
                username,
                password
            }, 'basic');
            saveSession(data);
            showView('ads');
        } catch (error) {
            handleError(error);
        }
    }

    async function logout () {
        try {
            let data = await requester.post('user', '_logout', {
               authtoken:localStorage.getItem('authtoken')
            });
           localStorage.clear();
           userLoggedOut();
            showView('home');
            
        } catch (err) {
            handleError(err);
        }
    }
}