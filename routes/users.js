const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');

router.get('/register', (req, res) => {
    res.render('users/register');
});

router.post('/register', catchAsync(async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Restaurant Review!');
            res.redirect('/restaurants');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}));
//serving a form for login
router.get('/login', (req, res) => {
    res.render('users/login');
})
// do loggin in
router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'welcome back!');
    const redirectUrl = req.session.returnTo || '/restaurants';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
})


//logout
router.get('/logout', (req, res) => {
    req.logout();//from passport
    req.flash('success', "Goodbye!");
    res.redirect('/restaurants');
})

module.exports = router;