const Cart = require('../models/Cart');

// GET /api/cart
exports.getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }) || { items: [] };
    res.json({ success: true, cart });
  } catch (err) { next(err); }
};

// POST /api/cart/sync — replace entire cart (called on page load / cart change)
exports.syncCart = async (req, res, next) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'ITEMS MUST BE AN ARRAY.' });
    }
    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      { items },
      { upsert: true, new: true, runValidators: true }
    );
    res.json({ success: true, cart });
  } catch (err) { next(err); }
};

// DELETE /api/cart — clear cart
exports.clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    res.json({ success: true, message: 'CART CLEARED.' });
  } catch (err) { next(err); }
};
