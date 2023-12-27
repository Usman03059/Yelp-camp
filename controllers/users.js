const User = require('../models/user');

module.exports.registerpage = (req, res) => {
    res.render('user/register')
}
module.exports.register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ email, username })
        const useregister = await User.register(user, password);
        req.login(useregister, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to the Yelpcamp')
            res.redirect('/campgrounds')
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register')

    }
}
module.exports.loginpage = (req, res) => {
    res.render('user/login')
}
module.exports.login = (req, res) => {
    req.flash('success', 'Welcome Back!!')
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    res.redirect(redirectUrl);
}
module.exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
}