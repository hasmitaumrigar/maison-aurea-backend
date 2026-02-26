const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { createOrder, getMyOrders, getOrder } = require('../controllers/orderController');

router.use(protect);
router.post('/',   createOrder);
router.get('/',    getMyOrders);
router.get('/:id', getOrder);

module.exports = router;
