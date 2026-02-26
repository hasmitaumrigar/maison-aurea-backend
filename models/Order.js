const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  productId: { type: Number, required: true },
  name:      { type: String, required: true },
  type:      String,
  size:      { type: Number, enum: [50, 100], required: true },
  qty:       { type: Number, required: true, min: 1 },
  price:     { type: Number, required: true },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderId:  { type: String, unique: true, default: () => 'MA' + Date.now() },
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items:    [itemSchema],
  shipping: {
    name:    { type: String, required: true },
    phone:   { type: String, required: true },
    address: { type: String, required: true },
  },
  payment: {
    cardLast4:     String,
    cardHolder:    String,
    method:        { type: String, default: 'CARD' },
    transactionId: { type: String, default: () => 'TXN' + Date.now() },
  },
  pricing: {
    subtotal: { type: Number, required: true },
    shipping: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total:    { type: Number, required: true },
  },
  voucher: { code: String, label: String },
  status:  { type: String, enum: ['CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED'], default: 'CONFIRMED' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
