var express = require('express')
var app = express()

var Users = [];

app.get('/', function(req, res, next) {
    res.render('signup', { title: 'Sign Up' });
});

app.post('/', function(req, res, next) {
    if (!req.body.id || !req.body.password) {
        res.status("400");
        req.flash('error', "Invalid details!")
        res.render('signup', { title: 'Sign Up' });
    } else {
        var filter_val = 1;
        Users.filter(function(user) {
            if (user.id === req.body.id) {
                req.flash('error', "User Already Exists! Login or choose another user id")
                res.render('signup', { title: 'Sign Up' });
                filter_val = 2;

            }
        });
        if (filter_val == 1) {
            var newUser = { id: req.body.id, password: req.body.password };
            Users.push(newUser);
            req.session.user = newUser;
            res.redirect('signup/protected_page');
        }
    }
});


function checkSignIn(req, res, next) {
    if (req.session.user) {
        next(); //If session exists, proceed to page
    } else {
        var err = new Error("Not logged in!");
        console.log(req.session.user);
        next(err); //Error, trying to access unauthorized page!
    }
}

app.get('/protected_page', checkSignIn, function(req, res, next) {
    res.render('protected_page', { id: req.session.user.id })
});

app.get('/login', function(req, res) {
    res.render('login', { title: "Login" });
});

app.post('/login', function(req, res) {
    // console.log(Users);
    if (!req.body.id || !req.body.password) {
        req.flash('error', "Please enter both id and password!")
        res.render('login', { title: "Login" });
    } else {
        var filter_val = 1;
        Users.filter(function(user) {
            if (user.id === req.body.id && user.password === req.body.password) {
                req.session.user = user;
                res.redirect('../signup/protected_page');
                filter_val = 2;
            }
        });
        if (filter_val == 1) {
            req.flash('error', "Invalid credentials!")
            res.render('login', { title: "Login" });
        }
    }
});

app.get('/logout', function(req, res) {


    req.session.destroy(function() {
        //console.log('session destroyed');
    });


    res.redirect('../signup/login');
});

app.use('/protected_page', function(err, req, res, next) {
    console.log(err);
    //User should be authenticated! Redirect him to log in.
    res.redirect('../signup/login');
});

module.exports = app;