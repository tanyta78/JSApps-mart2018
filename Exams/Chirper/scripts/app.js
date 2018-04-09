const handlers = {};
$(() => {
    const app = Sammy('#main', function () {

        this.use('Handlebars', 'hbs');

        this.get('index.html', (ctx) => {

            ctx.loggedIn = auth.loggedIn();

            if (ctx.loggedIn) {
                ctx.username = sessionStorage.username;
                this.redirect('#/home');
                return;

            }
            ctx.redirect('#/login');

        });

        this.get('#/home', handlers.feed);
        this.get('#/home/:filter', handlers.feed);

        this.post('#/create', handlers.create);
        this.get('#/follow/:target', handlers.follow);
        this.get('#/unfollow/:target', handlers.unfollow);
        this.get('#/delete/:id', handlers.deleteChirp);

        this.get('#/discover', handlers.discover);
      
        this.get('#/register', (ctx) => {
            ctx.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
                registerForm: './templates/register/registerForm.hbs'
            }).then(function () {
                this.partial('./templates/register/registerPage.hbs');
            });
        });

        this.post('#/register', (ctx) => {
            let username = ctx.params.username;
            let password = ctx.params.password;
            let repeatPassword = ctx.params.repeatPass;

            if (password !== repeatPassword) {
                alert('Passwords do not match');
            } else {
                auth.register(username, password)
                    .then((userData) => {
                        auth.saveSession(userData);
                        ctx.redirect('#/index.html');
                    })
                    .catch((error) => {
                        notify.handleError(error);
                    });
            }
        });

        this.get('#/login', (ctx) => {
            ctx.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
                loginForm: './templates/login/loginForm.hbs'
            }).then(function () {
                this.partial('./templates/login/loginPage.hbs');
            });
        });

        this.post('#/login', (ctx) => {
            let username = ctx.params.username;
            let password = ctx.params.password;

            auth.login(username, password)
                .then((userData) => {
                    auth.saveSession(userData);
                    ctx.redirect('#/index.html');
                })
                .catch((error) => {
                    notify.handleError(error);
                });
        });

        this.get('#/logout', (ctx) => {
            auth.logout()
                .then(function () {
                    sessionStorage.clear();
                    ctx.redirect('#/index.html');
                })
                .catch((error) => {
                    notify.handleError(error);

                });

        });


    });

    app.run();

    function calcTime(time) {
        let diff = new Date - (new Date(time));
        diff = Math.floor(diff / 60000);
        if (diff < 1) return 'now';
        if (diff < 60) return diff + ' minute' + pluralize(diff);
        diff = Math.floor(diff / 60);
        if (diff < 24) return diff + ' hour' + pluralize(diff);
        diff = Math.floor(diff / 24);
        if (diff < 30) return diff + ' day' + pluralize(diff);
        diff = Math.floor(diff / 30);
        if (diff < 12) return diff + ' month' + pluralize(diff);
        diff = Math.floor(diff / 12);
        return diff + ' year' + pluralize(diff);

        function pluralize(value) {
            if (value !== 1) return 's';
            else return '';
        }
    }
});