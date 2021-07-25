const { Signup, Signin, Signout, IsUserAdmin, Token } = require('../controller/auth');
const { IsSignIn } = require('../controller/Helper/auth');
const router = require('express').Router();

router.post('/signup', Signup);
router.post('/signin', Signin);
router.post('/token', Token);
router.get('/signout', Signout);

module.exports = router;