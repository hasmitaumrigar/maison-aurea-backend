const router = require('express').Router();
const { signup, login, getMe, changePassword, signupRules, loginRules } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/signup', signupRules, signup);
router.post('/login',  loginRules,  login);
router.get('/me',      protect,     getMe);
router.put('/change-password', protect, changePassword);

module.exports = router;
