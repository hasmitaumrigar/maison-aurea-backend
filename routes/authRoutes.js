const router = require('express').Router();
const { signup, login, getMe, changePassword, signupRules, loginRules, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/signup', signupRules, signup);
router.post('/login',  loginRules,  login);
router.get('/me',      protect,     getMe);
router.put('/change-password', protect, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
module.exports = router;

