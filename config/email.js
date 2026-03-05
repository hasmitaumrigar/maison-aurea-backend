const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOrderConfirmation = async (toEmail, order, userName) => {
  await resend.emails.send({
    from: 'MAISON AURÈA <onboarding@resend.dev>',
     to: process.env.FROM_EMAIL,
    subject: `ORDER CONFIRMED #${order.orderId} — MAISON AURÈA`,
    html: `
    <div style="font-family:Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #e8e0d0;">
      <div style="background:#080808;padding:40px;text-align:center;">
        <h1 style="color:#C9A84C;font-size:1.6rem;letter-spacing:0.35em;font-weight:300;margin:0;">MAISON AURÈA</h1>
      </div>
      <div style="padding:40px;">
        <h2 style="font-size:1.1rem;font-weight:300;color:#1a1a1a;">Dear ${userName},</h2>
        <p style="font-size:13px;color:#666;line-height:1.8;">Your order has been confirmed. Thank you for choosing MAISON AURÈA.</p>
        <div style="background:#F9F6F0;padding:18px 20px;margin:20px 0;border-left:3px solid #C9A84C;">
          <p style="font-size:13px;color:#333;margin:3px 0;">Order ID: <strong>#${order.orderId}</strong></p>
          <p style="font-size:13px;color:#333;margin:3px 0;">Total: <strong style="color:#C9A84C;">₹${order.pricing.total.toLocaleString('en-IN')}</strong></p>
          <p style="font-size:13px;color:#333;margin:3px 0;">Deliver to: <strong>${order.shipping.name} · ${order.shipping.phone}</strong></p>
          <p style="font-size:13px;color:#333;margin:3px 0;">Address: <strong>${order.shipping.address}</strong></p>
        </div>
        ${order.items.map(i=>`
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f0e8d0;font-size:13px;">
          <span>${i.name} (${i.size}ML) ×${i.qty}</span>
          <span style="color:#C9A84C;">₹${(i.price*i.qty).toLocaleString('en-IN')}</span>
        </div>`).join('')}
        <div style="display:flex;justify-content:space-between;padding:12px 0;font-size:15px;color:#C9A84C;font-weight:600;border-top:2px solid #ddd;margin-top:8px;">
          <span>TOTAL PAID</span><span>₹${order.pricing.total.toLocaleString('en-IN')}</span>
        </div>
      </div>
      <div style="background:#080808;padding:24px;text-align:center;">
        <p style="color:rgba(255,255,255,0.3);font-size:10px;margin:0;">© 2026 MAISON AURÈA</p>
      </div>
    </div>`,
  });
};

const sendOwnerNotification = async (order, userName, userEmail) => {
  await resend.emails.send({
    from: 'MAISON AURÈA <onboarding@resend.dev>',
    to: process.env.FROM_EMAIL,
    subject: `🛍️ NEW ORDER #${order.orderId} — ₹${order.pricing.total.toLocaleString('en-IN')} — ${userName}`,
    html: `
    <div style="font-family:Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;padding:30px;border:1px solid #e0d5c0;">
      <h2 style="color:#C9A84C;letter-spacing:0.2em;font-weight:300;">NEW ORDER RECEIVED</h2>
      <p style="font-size:13px;"><strong>Customer:</strong> ${userName} (${userEmail})</p>
      <p style="font-size:13px;"><strong>Phone:</strong> ${order.shipping.phone}</p>
      <p style="font-size:13px;"><strong>Address:</strong> ${order.shipping.address}</p>
      <p style="font-size:13px;"><strong>Order ID:</strong> #${order.orderId}</p>
      <p style="font-size:13px;"><strong>Total:</strong> ₹${order.pricing.total.toLocaleString('en-IN')}</p>
      <hr style="border:1px solid #e0d5c0;margin:16px 0;">
      ${order.items.map(i=>`
      <div style="display:flex;justify-content:space-between;font-size:13px;padding:6px 0;">
        <span>${i.name} (${i.size}ML) ×${i.qty}</span>
        <span>₹${(i.price*i.qty).toLocaleString('en-IN')}</span>
      </div>`).join('')}
      <div style="font-size:15px;color:#C9A84C;font-weight:600;padding:10px 0;border-top:2px solid #ddd;margin-top:8px;">
        TOTAL: ₹${order.pricing.total.toLocaleString('en-IN')}
      </div>
    </div>`,
  });
};

const sendContactEmail = async ({ name, email, message }) => {
  await resend.emails.send({
    from: 'MAISON AURÈA <onboarding@resend.dev>',
    to: process.env.FROM_EMAIL,
    replyTo: email,
    subject: `CONTACT — ${name.toUpperCase()} | MAISON AURÈA`,
    html: `<p><strong>From:</strong> ${name} (${email})</p><p>${message}</p>`,
  });
};

const sendCancellationEmail = async (toEmail, order, userName) => {
  await resend.emails.send({
    from: 'MAISON AURÈA <onboarding@resend.dev>',
    to: process.env.FROM_EMAIL,
    subject: `ORDER CANCELLED #${order.orderId} — MAISON AURÈA`,
    html: `
    <div style="font-family:Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #e8e0d0;">
      <div style="background:#080808;padding:40px;text-align:center;">
        <h1 style="color:#C9A84C;font-size:1.6rem;letter-spacing:0.35em;font-weight:300;margin:0;">MAISON AURÈA</h1>
      </div>
      <div style="padding:40px;">
        <h2 style="font-size:1.1rem;font-weight:300;color:#1a1a1a;">Dear ${userName},</h2>
        <p style="font-size:13px;color:#666;line-height:1.8;">Your order has been successfully cancelled as requested.</p>
        <div style="background:#fff5f5;padding:18px 20px;margin:20px 0;border-left:3px solid #e55;">
          <p style="font-size:13px;color:#333;margin:3px 0;">Order ID: <strong>#${order.orderId}</strong></p>
          <p style="font-size:13px;color:#333;margin:3px 0;">Status: <strong style="color:#e55;">CANCELLED</strong></p>
          <p style="font-size:13px;color:#333;margin:3px 0;">Amount: <strong>₹${order.pricing.total.toLocaleString('en-IN')}</strong></p>
        </div>
        <p style="font-size:13px;color:#666;line-height:1.8;">If you have any questions please contact us. We hope to serve you again soon.</p>
      </div>
      <div style="background:#080808;padding:24px;text-align:center;">
        <p style="color:rgba(255,255,255,0.3);font-size:10px;margin:0;">© 2026 MAISON AURÈA</p>
      </div>
    </div>`,
  });
};
const sendResetEmail = async (to, resetLink, name) => {
  await resend.emails.send({
    from: 'MAISON AURÈA <onboarding@resend.dev>',
    to,
    subject: 'RESET YOUR PASSWORD — MAISON AURÈA',
    html: `
      <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;background:#0a0a0a;color:#e8e0d0;padding:40px;">
        <h2 style="color:#C9A84C;letter-spacing:0.15em;font-size:1.1rem;">MAISON AURÈA</h2>
        <p style="margin-top:24px;">DEAR ${name.toUpperCase()},</p>
        <p>WE RECEIVED A REQUEST TO RESET YOUR PASSWORD.</p>
        <a href="${resetLink}" style="display:inline-block;margin:24px 0;padding:14px 32px;background:#C9A84C;color:#0a0a0a;text-decoration:none;letter-spacing:0.1em;font-size:0.85rem;">RESET MY PASSWORD →</a>
        <p style="color:#888;font-size:0.8rem;">THIS LINK EXPIRES IN 1 HOUR. IF YOU DID NOT REQUEST THIS, PLEASE IGNORE THIS EMAIL.</p>
      </div>
    `
  });
};
module.exports = { sendOrderConfirmation, sendOwnerNotification, sendContactEmail, sendCancellationEmail, sendResetEmail };