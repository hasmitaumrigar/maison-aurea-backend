const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: { rejectUnauthorized: false },
});

// ── Order Confirmation Email ───────────────────────────────────
const sendOrderConfirmation = async (toEmail, order, userName) => {
  const itemsHTML = order.items.map(i =>
    `<tr>
      <td style="padding:10px 14px;border-bottom:1px solid #f0e8d0;font-size:13px;color:#333;">${i.name} (${i.size}ML)</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f0e8d0;font-size:13px;color:#333;">×${i.qty}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f0e8d0;font-size:13px;color:#C9A84C;font-weight:600;">₹${(i.price * i.qty).toLocaleString('en-IN')}</td>
    </tr>`
  ).join('');

  const discountRow = order.pricing.discount > 0
    ? `<div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#5aaa88;">
        <span>DISCOUNT SAVED</span><span>−₹${order.pricing.discount.toLocaleString('en-IN')}</span>
       </div>` : '';

  const html = `
  <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #e8e0d0;">
    <div style="background:#080808;padding:40px;text-align:center;">
      <h1 style="color:#C9A84C;font-size:1.6rem;letter-spacing:0.35em;font-weight:300;margin:0;">MAISON AURÈA</h1>
      <p style="color:rgba(201,168,76,0.55);font-size:0.6rem;letter-spacing:0.35em;margin-top:8px;margin-bottom:0;">LUXURY FRAGRANCES</p>
    </div>
    <div style="padding:40px;">
      <p style="font-size:11px;letter-spacing:0.2em;color:#C9A84C;margin-bottom:6px;">ORDER CONFIRMED</p>
      <h2 style="font-size:1.3rem;font-weight:300;color:#1a1a1a;margin:0 0 20px;">Dear ${userName},</h2>
      <p style="font-size:13px;color:#666;line-height:1.8;margin-bottom:28px;">Your order has been confirmed and is now being prepared with care. Thank you for choosing MAISON AURÈA.</p>
      <div style="background:#F9F6F0;padding:18px 20px;margin-bottom:24px;border-left:3px solid #C9A84C;">
        <p style="font-size:10px;letter-spacing:0.2em;color:#C9A84C;margin:0 0 10px;">ORDER REFERENCE</p>
        <p style="font-size:13px;color:#333;margin:3px 0;">Order ID: <strong>#${order.orderId}</strong></p>
        <p style="font-size:13px;color:#333;margin:3px 0;">Date: <strong>${new Date(order.createdAt).toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'})}</strong></p>
        <p style="font-size:13px;color:#333;margin:3px 0;">Status: <strong style="color:#5aaa88;">CONFIRMED</strong></p>
      </div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <thead>
          <tr style="background:#F9F6F0;">
            <th style="padding:10px 14px;text-align:left;font-size:10px;letter-spacing:0.15em;color:#888;font-weight:500;">ITEM</th>
            <th style="padding:10px 14px;text-align:left;font-size:10px;letter-spacing:0.15em;color:#888;font-weight:500;">QTY</th>
            <th style="padding:10px 14px;text-align:left;font-size:10px;letter-spacing:0.15em;color:#888;font-weight:500;">PRICE</th>
          </tr>
        </thead>
        <tbody>${itemsHTML}</tbody>
      </table>
      <div style="background:#F9F6F0;padding:16px 20px;border-top:2px solid #e0d5c0;">
        <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px;color:#666;">
          <span>SUBTOTAL</span><span>₹${order.pricing.subtotal.toLocaleString('en-IN')}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px;color:#666;">
          <span>SHIPPING</span><span>${order.pricing.shipping === 0 ? 'FREE' : '₹' + order.pricing.shipping}</span>
        </div>
        ${discountRow}
        <div style="display:flex;justify-content:space-between;padding:10px 0 4px;font-size:15px;color:#C9A84C;font-weight:600;border-top:1px solid #ddd;margin-top:6px;">
          <span>TOTAL PAID</span><span>₹${order.pricing.total.toLocaleString('en-IN')}</span>
        </div>
      </div>
      <div style="margin-top:28px;padding:18px 20px;border:1px solid #e8e0d0;">
        <p style="font-size:10px;letter-spacing:0.2em;color:#C9A84C;margin:0 0 8px;">DELIVERY ADDRESS</p>
        <p style="font-size:13px;color:#333;margin:0;line-height:1.6;">${order.shipping.name}<br>${order.shipping.phone}<br>${order.shipping.address}</p>
      </div>
    </div>
    <div style="background:#080808;padding:24px;text-align:center;">
      <p style="color:rgba(255,255,255,0.3);font-size:10px;letter-spacing:0.1em;margin:0;">© 2026 MAISON AURÈA · ALL RIGHTS RESERVED</p>
    </div>
  </div>`;

  await transporter.sendMail({
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: toEmail,
    subject: `ORDER CONFIRMED #${order.orderId} — MAISON AURÈA`,
    html,
  });
};

// ── Contact Form Email ─────────────────────────────────────────
const sendContactEmail = async ({ name, email, message }) => {
  await transporter.sendMail({
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: process.env.FROM_EMAIL,
    replyTo: email,
    subject: `CONTACT — ${name.toUpperCase()} | MAISON AURÈA`,
    html: `
    <div style="font-family:Helvetica,Arial,sans-serif;max-width:500px;padding:30px;border:1px solid #e0d5c0;">
      <h2 style="color:#C9A84C;letter-spacing:0.2em;font-weight:300;margin-bottom:20px;">NEW CONTACT MESSAGE</h2>
      <p style="margin:6px 0;font-size:13px;"><strong>FROM:</strong> ${name}</p>
      <p style="margin:6px 0;font-size:13px;"><strong>EMAIL:</strong> ${email}</p>
      <p style="margin:16px 0 8px;font-size:13px;"><strong>MESSAGE:</strong></p>
      <p style="background:#f9f6f0;padding:16px;border-left:3px solid #C9A84C;font-size:13px;line-height:1.7;color:#333;">${message}</p>
    </div>`,
  });
};

module.exports = { transporter, sendOrderConfirmation, sendContactEmail };
