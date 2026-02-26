const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { getCart, syncCart, clearCart } = require('../controllers/cartController');

router.use(protect);
router.get('/',      getCart);
router.post('/sync', syncCart);
router.delete('/',   clearCart);

module.exports = router;
