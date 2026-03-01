const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { createOrder, getMyOrders, getOrder, cancelOrder } = require('../controllers/orderController');

router.use(protect);
router.post('/',   createOrder);
router.get('/',    getMyOrders);
router.get('/:id',        getOrder);
router.post('/:id/cancel', cancelOrder);

module.exports = router;
