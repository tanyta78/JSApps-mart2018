$(() => {
    const app = Sammy('#container', function () {
        this.use('Handlebars', 'hbs');


        this.get('#/home', getWelcomePage);
        this.get('/index.html', getWelcomePage);

        function getWelcomePage(ctx) {

            ctx.isAuth = auth.isAuth();
            ctx.username = sessionStorage.getItem('username');
            if (auth.isAuth()) {
                ctx.redirect('#/activeReceipt');
            } else {
                ctx.loadPartials({
                    loginForm: './templates/forms/loginForm.hbs',
                    registerForm: './templates/forms/registerForm.hbs',
                    footer: './templates/common/footer.hbs',
                }).then(function () {
                    this.partial('./templates/welcome.hbs');
                });
            }

        }

        this.post('#/register', (ctx) => {
            let username = ctx.params['username-register'];
            let password = ctx.params['password-register'];
            let passRep = ctx.params['password-register-check'];

            if (username.length < 5) {
                notify.showError('A username should be a string with at least 5 characters long!');

            } else if (password === '' || passRep === '') {
                notify.showError('Passwords input fields shouldn’t be empty!');
            } else if (password !== passRep) {
                notify.showError('Both passwords should match!');
            } else {
                auth.register(username, password)
                    .then((userData) => {
                        auth.saveSession(userData);
                        notify.showInfo('User registration successful');
                        ctx.redirect('#/home');
                    }).catch(auth.handleError);
            }
        });

        this.post('#/login', (ctx) => {
            let username = ctx.params['username-login'];
            let password = ctx.params['password-login'];

            if (username === '' || password === '') {
                notify.handleError('All fields should be non empty');
            } else {
                auth.login(username, password)
                    .then((userData) => {
                        auth.saveSession(userData);
                        ctx.username = sessionStorage.getItem('username');
                        notify.showInfo('Login successful.');
                        ctx.redirect('#/home');
                    })
                    .catch(notify.handleError);
            }
        });

        this.get('#/logout', (ctx) => {
            auth.logout()
                .then(() => {
                    sessionStorage.clear();
                    notify.showInfo('Successful Logout!');
                    ctx.redirect('#/home');
                }).catch(notify.handleError);
        });


        this.get('#/activeReceipt', (ctx) => {
            let receiptId;
            service.getActiveReceipt()
                .then((activeReceipt) => {
                    if (activeReceipt.length === 0) {
                        service.createEmptyReceipt()
                            .then((receipt) => {
                                receiptId = receipt._id;
                                $('#receiptId').val(receipt._id);
                            });
                    } else {
                        receiptId = activeReceipt[0]._id;
                    }
                   
                    ctx.receiptId = receiptId;
                    $('#receiptId').val(receiptId);

                    service.getEntriesByReceiptId(receiptId)
                    .then((entries) => {
                        console.log(receiptId);
                        console.log(entries);
                        ctx.username = sessionStorage.getItem('username');
    
                        let total=0;
                        let productCount=0;
                        entries.forEach((e, i) => {
                            e.subtotal = Number(e.qty) * Number(e.price);
                            total+=e.subtotal;
                            productCount++;
                        });
    
                        ctx.entries=entries;
                        ctx.total=total;
                        ctx.productCount=productCount;
    
                        ctx.loadPartials({
                            header: './templates/common/header.hbs',
                            footer: './templates/common/footer.hbs',
                            entry: './templates/common/entry.hbs',
                            createEntryForm: './templates/forms/createEntryForm.hbs',
                            createReceiptForm: './templates/forms/createReceiptForm.hbs'
                        }).then(function () {
                            this.partial('./templates/views/createReceiptView.hbs');
                        });
                    })
                    .catch(notify.handleError);

                })
                .catch(notify.handleError);
    
        });

        this.post('#/create', (ctx) => {
            let type = ctx.params.type;
            let qty = Number(ctx.params.qty);
            let price = Number(ctx.params.price);
            let receiptId = $('#receiptId').val();
           
           if(type===''){
               notify.showError('Product name must be a non-empty string!');
           }else if(isNaN(qty)){
                notify.showError('Quantity must be a number!');
           }else if(isNaN(price)){
                 notify.showError('Price must be a number!');
           }else{
            service.addEntry(type, qty, price, receiptId)
                .then(() => {
                    notify.showInfo('Entry added');
                    ctx.redirect('#/activeReceipt');
                }).catch(notify.handleError);
            console.log(ctx);
           }     
           
        });

        this.post('#/commit',(ctx)=>{
          
            let productCount = Number(ctx.params.productCount);
            let total = Number(ctx.params.total);
            let receiptId = $('#receiptId').val();
           console.log(productCount);
           console.log(total);
           console.log(receiptId);
           if(productCount===0){
               notify.showError('Receipt must contains at least one entry !');
           }else{
            service.commitReceipt(receiptId,productCount,total)
                .then(() => {
                    notify.showInfo('Receipt checked out');
                    service.createEmptyReceipt()
                            .then((receipt) => {
                                $('#receiptId').val(receipt._id);
                            });
                    ctx.redirect('#/activeReceipt');
                }).catch(notify.handleError);
            console.log(ctx);
           }     
        });

        this.get('#/delete/:id',(ctx)=>{
            let id = ctx.params.id;
            console.log(id);
            service.deleteEntry(id)
                .then(() => {
                    notify.showInfo('Entry deleted');
                    ctx.redirect('#/activeReceipt');
            }).catch(notify.handleError);
        });

        this.get('#/myReceipts', (ctx) => {
            if (!auth.isAuth()) {
                ctx.redirect('#/home');
                return;
            }
            let username = sessionStorage.username;

            service.getMyReceipts()
                .then((receipts) => {
                    let total=0;
                    receipts.forEach((r, i) => {
                        r.date = formatDate(r._kmd.ect);
                        total+=Number(r.total);
                    });
                    
                    ctx.username=sessionStorage.username;
                    ctx.receipts = receipts;
                    ctx.total=total.toFixed(2);

                    ctx.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        receipt: './templates/common/receipt.hbs'
                    }).then(function () {
                        this.partial('./templates/views/allReceiptsView.hbs');
                    });
                }).catch(notify.handleError);
        });

        this.get('#/detail/:id', (ctx) => {
            if (!auth.isAuth()) {
                ctx.redirect('#/home');
                return;
            }
            ctx.isAuth = auth.isAuth();
            ctx.username = sessionStorage.getItem('username');
            let id = ctx.params.id;

            service.getReceiptDetails(id)
                .then((receipt) => {
                    let receiptId=receipt._id;
                    service.getEntriesByReceiptId(receiptId)
                        .then((entries)=>{
                            ctx.username = sessionStorage.getItem('username');
    
                            let total=0;
                            let productCount=0;
                            entries.forEach((e, i) => {
                                e.subtotal = Number(e.qty) * Number(e.price);
                                total+=e.subtotal;
                                productCount++;
                            });
        
                            ctx.entries=entries;
                            ctx.total=total;
                            ctx.productCount=productCount;

                            ctx.loadPartials({
                                header: './templates/common/header.hbs',
                                footer: './templates/common/footer.hbs',
                                entryDetails:'./templates/common/entryDetails.hbs'
                            }).then(function () {
                                this.partial('./templates/views/receiptDetailView.hbs');
                            });
                        })
                        .catch(notify.showError);              
                }).catch(notify.showError);

        });

      

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