const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { createOrder, getMyOrders, getOrder, cancelOrder, createPaymentIntent } = require('../controllers/orderController');
router.post('/create-payment-intent', protect, createPaymentIntent);
router.use(protect);
router.post('/',   createOrder);
router.get('/',    getMyOrders);
router.get('/:id',        getOrder);
router.post('/:id/cancel', cancelOrder);

module.exports = router;
