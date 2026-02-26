const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  productId: { type: Number, required: true },
  name:      { type: String, required: true },
  type:      String,
  size:      { type: Number, enum: [50, 100], required: true },
  qty:       { type: Number, required: true, min: 1, max: 20 },
  price:     { type: Number, required: true },
}, { _id: false });

const cartSchema = new mongoose.Schema({
  user:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [itemSchema],
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
