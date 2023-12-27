const express = require('express')
const User = require('../models/user');
const catchAsync = require('../utils/asyncerror');
const passport = require('passport');
const { checkReturnTo } = require('../middlever')
const router = express.Router();
const user = require('../controllers/users')

router.get('/register', user.registerpage)
router.post('/register', catchAsync(user.register))

router.get('/login', user.loginpage)
router.post('/login', checkReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), user.login)

router.get('/logout', user.logout);
module.exports = router;