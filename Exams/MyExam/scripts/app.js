$(() => {
    const app = Sammy('#app', function () {
        this.use('Handlebars', 'hbs');


        this.get('#/home', getWelcomePage);
        this.get('index.html', getWelcomePage);

        function getWelcomePage(ctx) {

            ctx.isAuth = auth.isAuth();
            ctx.username = sessionStorage.getItem('username');
            ctx.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
            }).then(function () {
                this.partial('./templates/welcome.hbs');
            });

        }

        this.get('#/register', (ctx) => {
            ctx.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs'
            }).then(function () {
                this.partial('./templates/forms/registerForm.hbs');
            });

        });

        this.post('#/register', (ctx) => {
            let username = ctx.params.username;
            let password = ctx.params.password;
            let name = ctx.params.name;

            auth.register(username, password, name)
                .then((userData) => {
                    auth.saveSession(userData);
                    auth.showInfo('User registration successful');
                    ctx.redirect('#/home');
                }).catch(auth.handleError);


        });

        this.get('#/login', (ctx) => {
            ctx.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs'
            }).then(function () {
                this.partial('./templates/forms/loginForm.hbs');
            });

        });

        this.post('#/login', (ctx) => {
            let username = ctx.params.username;
            let password = ctx.params.password;

            if (username === '' || password === '') {
                auth.handleError('All fields should be non empty');
            } else {
                auth.login(username, password)
                    .then((userData) => {
                        auth.saveSession(userData);
                        ctx.username = sessionStorage.getItem('username');
                        auth.showInfo('Login successful!');
                        ctx.redirect('#/home');
                    })
                    .catch(auth.handleError);
            }
        });

        this.get('#/logout', (ctx) => {
            auth.logout()
                .then(() => {
                    sessionStorage.clear();
                    auth.showInfo('Successful Logout!');
                    ctx.redirect('#/home');
                }).catch(auth.handleError);
        });

        this.get('#/myMessages', (ctx) => {
            if (!auth.isAuth()) {
                ctx.redirect('#/home');
                return;
            }
            let username = sessionStorage.username;

            messages.getMyMessages(username)
                .then((messages) => {
                    messages.forEach((m, i) => {
                        m.date = formatDate(m._kmd.ect);
                    });

                    ctx.isAuth = auth.isAuth();
                    ctx.username = sessionStorage.getItem('username');
                    ctx.messages = messages;

                    ctx.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        message: './templates/messages/message.hbs'
                    }).then(function () {
                        this.partial('./templates/messages/myMessagePage.hbs');
                    });
                }).catch(auth.showError);
        });

        this.get('#/send', (ctx) => {
            if (!auth.isAuth()) {
                ctx.redirect('#/home');
                return;
            }
            ctx.isAuth = auth.isAuth();
            ctx.username = sessionStorage.getItem('username');

            messages.getAllUsers()
                .then((userList) => {
                    ctx.userList = userList;
                    ctx.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs'
                    }).then(function () {
                        this.partial('./templates/messages/sendMessagePage.hbs');
                    });
                }).catch(auth.showError);

        });

        this.post('#/send', (ctx) => {
            if (!auth.isAuth()) {
                ctx.redirect('#/home');
                return;
            }

            let sender_username = sessionStorage.getItem('username');
            let sender_name = sessionStorage.getItem('name');
            let recipient_username = ctx.params.recipient;
            let text = ctx.params.text;


            if (text === '') {
                auth.showError('Text is required!');
            } else {
                messages.createMessage(sender_username, sender_name, recipient_username, text)
                    .then(() => {
                        auth.showInfo('Message sent.');
                        ctx.redirect('#/archive');
                    })
                    .catch(auth.handleError);
            }
        });

        this.get('#/archive', (ctx) => {
            if (!auth.isAuth()) {
                ctx.redirect('#/home');
                return;
            }
            ctx.isAuth = auth.isAuth();
            ctx.username = sessionStorage.getItem('username');

            messages.getArchiveMessages(ctx.username)
                .then((messages) => {
                    messages.forEach((m, i) => {
                        m.date = formatDate(m._kmd.ect);
                    });

                    ctx.messages = messages;

                    ctx.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        archive: './templates/messages/archive.hbs'
                    }).then(function () {
                        this.partial('./templates/messages/archivePage.hbs')
                            .then(() => {
                                $('button')
                                    .click((e) => {
                                        let id = $(e.target).attr('data-id');
                                        deleteMessage(id);
                                        ctx.redirect('#/home');
                                    });
                            });
                    });
                }).catch(auth.showError);
        });

    });

    app.run();

    function deleteMessage (messageId,ctx) {
        messages.deleteMessage(messageId).then(()=>{
            auth.showInfo('Message deleted');
           
        });
    }

    function formatDate(dateISO8601) {
        let date = new Date(dateISO8601);
        if (Number.isNaN(date.getDate()))
            return '';
        return date.getDate() + '.' + padZeros(date.getMonth() + 1) +
            "." + date.getFullYear() + ' ' + date.getHours() + ':' +
            padZeros(date.getMinutes()) + ':' + padZeros(date.getSeconds());

        function padZeros(num) {
            return ('0' + num).slice(-2);
        }
    }

    function formatSender(name, username) {
        if (!name)
            return username;
        else
            return username + ' (' + name + ')';
    }


});