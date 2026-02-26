const User = require('../models/User');

// GET /api/wishlist
exports.getWishlist = (req, res) => {
  res.json({ success: true, wishlist: req.user.wishlist || [] });
};

// POST /api/wishlist/:productId — add to wishlist
exports.addToWishlist = async (req, res, next) => {
  try {
    const id = parseInt(req.params.productId);
    if (!id || id < 1 || id > 20) {
      return res.status(400).json({ success: false, message: 'INVALID PRODUCT ID.' });
    }
    const user = await User.findById(req.user._id);
    if (!user.wishlist.includes(id)) user.wishlist.push(id);
    await user.save();
    res.json({ success: true, wishlist: user.wishlist });
  } catch (err) { next(err); }
};

// DELETE /api/wishlist/:productId — remove from wishlist
exports.removeFromWishlist = async (req, res, next) => {
  try {
    const id = parseInt(req.params.productId);
    const user = await User.findById(req.user._id);
    user.wishlist = user.wishlist.filter(x => x !== id);
    await user.save();
    res.json({ success: true, wishlist: user.wishlist });
  } catch (err) { next(err); }
};
