const Order   = require('../models/Order');
const User    = require('../models/User');
const Voucher = require('../models/Voucher');
const Cart    = require('../models/Cart');
const { sendOrderConfirmation, sendOwnerNotification } = require('../config/email');

// Server-side price catalogue (prevents price tampering from frontend)
const PRICES = {
  1:{p50:3999,p100:6499},  2:{p50:4499,p100:7499},  3:{p50:3799,p100:6199},
  4:{p50:4199,p100:6999},  5:{p50:5499,p100:8999},  6:{p50:3499,p100:5799},
  7:{p50:4299,p100:6999},  8:{p50:3999,p100:6499},  9:{p50:4999,p100:7999},
  10:{p50:4499,p100:7499}, 11:{p50:3999,p100:6499}, 12:{p50:5299,p100:8499},
  13:{p50:4199,p100:6899}, 14:{p50:5799,p100:9499}, 15:{p50:4699,p100:7699},
  16:{p50:3799,p100:6199}, 17:{p50:6499,p100:10499},18:{p50:5999,p100:9499},
  19:{p50:4999,p100:7999}, 20:{p50:5499,p100:8999},
};

// POST /api/orders
exports.createOrder = async (req, res, next) => {
  try {
    const { items, shipping, payment, voucherCode } = req.body;

    if (!items?.length) {
      return res.status(400).json({ success: false, message: 'ORDER HAS NO ITEMS.' });
    }
    if (!shipping?.name || !shipping?.phone || !shipping?.address) {
      return res.status(400).json({ success: false, message: 'SHIPPING DETAILS ARE INCOMPLETE.' });
    }

    // ── Validate & recalculate prices server-side ─────────────
    let subtotal = 0;
    const validatedItems = items.map(item => {
      const catalogue = PRICES[item.productId];
      if (!catalogue) throw Object.assign(new Error(`INVALID PRODUCT ID: ${item.productId}`), { statusCode: 400 });
      const price = item.size === 100 ? catalogue.p100 : catalogue.p50;
      const qty = Math.max(1, Math.min(20, parseInt(item.qty) || 1));
      subtotal += price * qty;
      return { productId: item.productId, name: item.name, type: item.type, size: item.size, qty, price };
    });

    const shippingCost = subtotal >= 2999 ? 0 : 199;
    let discount = 0;
    let voucherInfo = null;

    // ── Voucher / First-Order Discount ────────────────────────
    if (voucherCode) {
      const voucher = await Voucher.findOne({ code: voucherCode.toUpperCase(), isActive: true });
      if (!voucher) {
        return res.status(400).json({ success: false, message: `VOUCHER CODE "${voucherCode.toUpperCase()}" IS INVALID.`, voucherError: true });
      }
      if (voucher.expiresAt && voucher.expiresAt < new Date()) {
        return res.status(400).json({ success: false, message: 'THIS VOUCHER CODE HAS EXPIRED.', voucherError: true });
      }
      if (voucher.type === 'firstorder' && req.user.ordersPlaced > 0) {
        return res.status(400).json({ success: false, message: 'THIS CODE IS FOR FIRST ORDERS ONLY.', voucherError: true });
      }
      discount = Math.round(subtotal * voucher.discount);
      voucherInfo = { code: voucher.code, label: voucher.label };
      await Voucher.findByIdAndUpdate(voucher._id, {
        $inc: { usedCount: 1 },
        $addToSet: { usedBy: req.user._id },
      });
    } else if (req.user.ordersPlaced === 0) {
      // Auto 20% first-order discount
      discount = Math.round(subtotal * 0.20);
      voucherInfo = { code: 'AUTO20', label: '20% FIRST ORDER DISCOUNT' };
    }

    const total = Math.max(0, subtotal + shippingCost - discount);

    // ── Create Order ──────────────────────────────────────────
    const order = await Order.create({
      user: req.user._id,
      items: validatedItems,
      shipping,
      payment: {
        cardHolder:    payment?.cardHolder || '',
        cardLast4:     (payment?.cardNumber || '').slice(-4) || '****',
        transactionId: 'TXN' + Date.now(),
      },
      pricing: { subtotal, shipping: shippingCost, discount, total },
      voucher: voucherInfo,
    });

    // ── Update User ───────────────────────────────────────────
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { ordersPlaced: 1 },
      isFirstTimeBuyer: false,
    });

    // ── Clear Cart ────────────────────────────────────────────
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    // ── Send Confirmation Email (non-blocking) ─────────────────
   // ── Send Confirmation Email to Customer (non-blocking) ────────
    sendOrderConfirmation(req.user.email, order, req.user.name).catch(err =>
      console.error('[EMAIL] Customer confirmation failed:', err.message)
    );

    // ── Send Owner Notification Email (non-blocking) ───────────────
    sendOwnerNotification(order, req.user.name, req.user.email).catch(err =>
      console.error('[EMAIL] Owner notification failed:', err.message)
    ); 

    res.status(201).json({ success: true, order });
  } catch (err) { next(err); }
};

// GET /api/orders  — user's own orders
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (err) { next(err); }
};

// GET /api/orders/:id
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'ORDER NOT FOUND.' });
    res.json({ success: true, order });
  } catch (err) { next(err); }
};
