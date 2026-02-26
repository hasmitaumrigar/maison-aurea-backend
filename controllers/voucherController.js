const Voucher = require('../models/Voucher');

// POST /api/vouchers/validate
exports.validateVoucher = async (req, res, next) => {
  try {
    const code = (req.body.code || '').trim().toUpperCase();
    if (!code) return res.status(400).json({ success: false, message: 'VOUCHER CODE IS REQUIRED.' });

    const voucher = await Voucher.findOne({ code, isActive: true });
    if (!voucher) {
      return res.status(400).json({ success: false, valid: false, message: `THE CODE "${code}" IS NOT VALID.` });
    }
    if (voucher.expiresAt && voucher.expiresAt < new Date()) {
      return res.status(400).json({ success: false, valid: false, message: 'THIS VOUCHER CODE HAS EXPIRED.' });
    }
    if (voucher.type === 'firstorder' && req.user.ordersPlaced > 0) {
      return res.status(400).json({ success: false, valid: false, message: 'THIS CODE IS FOR FIRST-TIME ORDERS ONLY.' });
    }

    res.json({ success: true, valid: true, discount: voucher.discount, label: voucher.label });
  } catch (err) { next(err); }
};
