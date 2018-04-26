$(() => {
    const app = Sammy('#container', function () {
        this.use('Handlebars', 'hbs');


        this.get('#/home', getWelcomePage);
        this.get('index.html', getWelcomePage);

        function getWelcomePage(ctx) {

            if (auth.isAuth()) {
                ctx.redirect('#/editor');
            } else {
                ctx.loadPartials({
                    loginForm: './templates/forms/loginForm.hbs',
                    footer: './templates/common/footer.hbs',
                    registerForm: './templates/forms/registerForm.hbs',
                }).then(function () {
                    this.partial('./templates/welcome.hbs');
                });
            }


        }

        this.post('#/register', (ctx) => {
            let usernameRegister = ctx.params.usernameRegister;
            let passwordRegister = ctx.params.passwordRegister;
            let repeatPassword = ctx.params.repeatPassword;

            console.log(usernameRegister);
            console.log(passwordRegister);
            console.log(repeatPassword);


            if (usernameRegister.length < 5) {
                notify.showError('Username should be at least 5 characters!');
            } else if (passwordRegister === '') {
                notify.showError('Password should not be empty!');
            } else if (repeatPassword !== passwordRegister) {
                notify.showError('Passwords should match!!!');
            } else {
                auth.register(usernameRegister, passwordRegister)
                    .then((userData) => {
                        auth.saveSession(userData);
                        notify.showInfo('User registration successful');
                        ctx.redirect('#/home');
                    }).catch(notify.showError);
            }
        });

        this.post('#/login', (ctx) => {
            let usernameLogin = ctx.params.usernameLogin;
            let passwordLogin = ctx.params.passwordLogin;

            if (usernameLogin === '' || passwordLogin === '') {
                notify.handleError('All fields should be non empty');
            } else {
                auth.login(usernameLogin, passwordLogin)
                    .then((userData) => {
                        auth.saveSession(userData);
                        ctx.username = sessionStorage.getItem('username');
                        notify.showInfo('Login successful!');
                        ctx.redirect('#/home');
                    })
                    .catch(notify.handleError);
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

        this.get('#/editor', (ctx) => {

            ctx.username = sessionStorage.username;

            receipts.getActiveReceipt()
                .then(async function (receiptInfo) {
                    if (receiptInfo.length === 0) {
                        await receipts.createReceipt(0, 0)
                            .then((receipt) => {
                                ctx.ActiveReceiptId = receipt._id;

                            });

                    } else {
                        ctx.ActiveReceiptId = receiptInfo[0]._id;
                    }

                    receipts.getEntriesByReceiptId(ctx.ActiveReceiptId)
                        .then((entries) => {
                            ctx.entries = entries;
                            console.log(ctx.ActiveReceiptId);
                            ctx.loadPartials({
                                header: './templates/common/header.hbs',
                                footer: './templates/common/footer.hbs',
                                createEntryForm: './templates/forms/createEntryForm.hbs',
                                createReceiptForm: './templates/forms/createReceiptForm.hbs'
                            }).then(function () {
                                this.partial('./templates/views/createReceiptView.hbs')
                            });
                        });
                })
                .catch(notify.handleError);
        });


        this.post('#/addEntry', (ctx) => {
            //type, qty, price, receiptId
            let type = ctx.params.type;
            let qty = ctx.params.qty;
            let price = ctx.params.price;

            let receiptId = $(this).attr('data-id');

            if (type === '') {
                notify.handleError('Type can not be empty');
            } else if (typeof qty !== 'number') {
                notify.handleError('Quantity must be a number');
            } else if (typeof price !== 'number') {
                notify.handleError('Quantity must be a number');
            } else {
                let sub = $(this).find('#subtotal').text(qty * price);

                receipts.addEntry(type, qty, price, receiptId)
                    .then((ctx) => {
                        ctx.recieptId=receipt._id;
                        ctx.productCount+= receipt.productCount;
                        ctx.total+= receipt.total;
                        ctx.redirect('#/editor');
                    })
                    .catch(notify.handleError);
            }

        });

        this.get('#/allReceipts', (ctx) => {
            receipts.getMyReceipts()
                .then((receipts) => {
                    receipts.forEach((r, i) => {
                        r.date = formatDate(r._kmd.ect);
                    });
                    ctx.receipts = receipts;
                    ctx.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        receipt: './templates/common/receipt.hbs',
                    }).then(function () {
                        this.partial('./templates/views/allReceiptsView.hbs');
                    });
                }).catch(notify.handleError);
        });

        this.get('#/receiptDetails/:_id', (ctx) => {

            receipts.getReceiptDetails(_id)
                .then((receipt) => {
                    receipts.getEntriesByReceiptId(receipt._id)
                        .then((entries) => {

                            entries.forEach((e, i) => {
                                e.subtotal = e.price * e.qty;
                            });

                            ctx.entries = entries;

                            ctx.loadPartials({
                                header: './templates/common/header.hbs',
                                footer: './templates/common/footer.hbs',
                                entry: './templates/common/entry.hbs',
                            }).then(function () {
                                this.partial('./templates/views/receiptDetailView.hbs');
                            });
                        })
                }).catch(notify.handleError);


        });

        this.get('#/delete/:_id', (ctx) => {

            receipts.deleteEntry(_id)
                .then(() => {
                    notify.showInfo('Entry removed');
                    ctx.redirect('#/editor');
                })
                .catch(notify.handleError);
        });

        this.post('#/checkout',(ctx)=>{

            
        })

    });

    app.run();

    

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


});