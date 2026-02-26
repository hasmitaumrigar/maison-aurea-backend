const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
  code:      { type: String, required: true, unique: true, uppercase: true, trim: true },
  type:      { type: String, enum: ['firstorder', 'percentage'], required: true },
  discount:  { type: Number, required: true }, // 0.20 = 20%
  label:     String,
  isActive:  { type: Boolean, default: true },
  expiresAt: { type: Date, default: null },     // null = never expires
  usedCount: { type: Number, default: 0 },
  usedBy:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

// Seed default voucher codes on startup
voucherSchema.statics.seed = async function () {
  const codes = [
    { code: 'AUREA10', type: 'percentage', discount: 0.10, label: '10% LOYALTY DISCOUNT' },
    { code: 'AUREA15', type: 'percentage', discount: 0.15, label: '15% SEASONAL DISCOUNT', expiresAt: new Date('2026-12-31') },
  ];
  for (const c of codes) {
    await this.findOneAndUpdate({ code: c.code }, c, { upsert: true });
  }
  console.log('[VOUCHERS] Seeded OK');
};

module.exports = mongoose.model('Voucher', voucherSchema);
