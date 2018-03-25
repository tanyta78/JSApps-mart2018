$(() => {
    //localStorage.clear();
    setGreeting();

    //Application settings
    const appKey = 'kid_HJwZlXBqM';
    const appSecret = '0c44fa2bed8d42d99360262850c8e604';
    const baseUrl = 'https://baas.kinvey.com/';

    //DOM elements


    //Event listeners
    $('#linkHome').click(() => showView('home'));
    $('#linkLogin').click(() => showView('login'));
    $('#linkRegister').click(() => showView('register'));
    $('#linkBooks').click(() => showView('books'));
    $('#linkCreate').click(() => showView('create'));
    $('#linkLogout').click(logout);

    $('#formLogin').submit(login);
    $('#formRegister').submit(register);

    $(document).on({
        ajaxStart: () => $('#loadingBox').show(),
        ajaxStop: () => $('#loadingBox').hide()
    });

    $('#infoBox').click((e) => $(e.target).hide());
    $('#errorBox').click((e) => $(e.target).hide());


    function showInfo(message) {
        $('#infoBox').text(message);
        $('#infoBox').show();
        setTimeout(() => $('#infoBox').hide(), 3000);
    }

    function showError(message) {
        $('#errorBox').text(message);
        $('#errorBox').show();
    }

    function handleError(err) {
        showError(err.responseJSON.description);
    }
    //Navigation and header
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
            case 'books':
                $('#viewBooks').show();
                break;
            case 'create':
                $('#viewCreateBook').show();
                break;
            case 'logout':
                $('#viewLogout').show();
                break;
        }
    }

    function makeHeader(type) {
        if(type==='basic'){
            return{
                'Authorization': 'Basic ' + btoa(appKey + ':' + appSecret),
                'Content-type': 'application/json'
            };
        }else{
            return{
                'Authorization': 'Kinvey ' + localStorage.getItem('authtoken'),
                'Content-type': 'application/json'
            };
        }      
    }

    //User session
    function setGreeting() {
        let username = localStorage.getItem('username');
        if (username !== null) {
            $('#loggedInUser').text(`Welcome, ${username}!`);
            $('#linkLogin').hide();
            $('#linkRegister').hide();
            $('#linkBooks').show();
            $('#linkCreate').show();
            $('#linkLogout').show();
        } else {
            $('#loggedInUser').text('');
            $('#linkLogin').show();
            $('#linkRegister').show();
            $('#linkBooks').hide();
            $('#linkCreate').hide();
            $('#linkLogout').hide();
        }
    }
    function setStorage(data) {
        localStorage.setItem('authtoken', data._kmd.authtoken);
        localStorage.setItem('username', data.username);
        setGreeting();
        showView('books');
    }
    function login(e) {
        e.preventDefault();
        console.log('Attempting login');

        let username = $('#inputUsername').val();
        let password = $('#inputPassword').val();

        let req = {
            url: baseUrl + 'user/' + appKey + '/login',
            method: 'POST',
            headers: makeHeader('basic'),
            data: JSON.stringify({
                username: username,
                password: password
            }),
            success: (data) => {
                showInfo('Login successful');
                setStorage(data);
            },
            error: handleError
        };

        $.ajax(req);

    }
    function register(e) {
        e.preventDefault();
        console.log('Attempting register');

        let username = $('#inputNewUsername').val();
        let password = $('#inputNewPassword').val();
        let repeat = $('#inputRepeatPassword').val();

        if (password !== repeat) {
            showError("Passwords don't match!");
            return;
        }

        let req = {
            url: baseUrl + 'user/' + appKey,
            method: 'POST',
            headers: makeHeader('basic'),
            data: JSON.stringify({
                username: username,
                password: password
            }),
            success: (data) => {
                showInfo('Registration successful');
                setStorage(data);
            },
            error: handleError
        };

        $.ajax(req);

        function registerSuccess(data) {
            localStorage.setItem('authtoken', data._kmd.authtoken);
            localStorage.setItem('username', data.username);
            showView('books');
        }

    }
    function logout() {

        let req = {
            url: baseUrl + 'user/' + appKey + '/_logout',
            method: 'POST',
            headers: makeHeader('kinvey'),
            success: logoutSuccess,
            error: handleError
        };

        $.ajax(req);

        function logoutSuccess(data) {
            localStorage.clear();
            setGreeting();
            showView('home');
        }

    }

    //Catalog
    function getBooks() {
        let req = {
            url: baseUrl + 'appdata/' + appKey + '/books',
            headers: makeHeader('kinvey'),
            success: displayBooks,
            error: handleError
        };

        $.ajax(req);

        function displayBooks(data) {
            
        }
    }
});