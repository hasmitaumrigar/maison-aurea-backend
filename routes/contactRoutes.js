const router = require('express').Router();
const { sendMessage, contactRules } = require('../controllers/contactController');

router.post('/', contactRules, sendMessage);

module.exports = router;
