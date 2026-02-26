const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { validateVoucher } = require('../controllers/voucherController');

router.post('/validate', protect, validateVoucher);

module.exports = router;
