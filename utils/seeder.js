// ══════════════════════════════════════════════════════════════
// MAISON AURÈA — Database Seeder
// Run: node utils/seeder.js
// ══════════════════════════════════════════════════════════════
require('dotenv').config();
const mongoose = require('mongoose');
const Voucher  = require('../models/Voucher');

const VOUCHERS = [
  { code: 'AUREA10', type: 'percentage', discount: 0.10, label: '10% LOYALTY DISCOUNT',  isActive: true },
  { code: 'AUREA15', type: 'percentage', discount: 0.15, label: '15% SEASONAL DISCOUNT', isActive: true, expiresAt: new Date('2026-12-31') },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✦ Connected to MongoDB');

    for (const v of VOUCHERS) {
      await Voucher.findOneAndUpdate({ code: v.code }, v, { upsert: true });
    }
    console.log(`✦ ${VOUCHERS.length} vouchers seeded`);

    console.log('✦ Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('✗ Seeder error:', err.message);
    process.exit(1);
  }
}

seed();
