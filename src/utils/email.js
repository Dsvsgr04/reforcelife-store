const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT),
  secure: false,
  auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS }
});

exports.sendOrderConfirmation = async (toEmail, order) => {
  const items = (order.items || []).map(i =>
    `<tr><td>${i.productName} x${i.quantity}</td><td align="right">$${parseFloat(i.totalPrice).toFixed(2)}</td></tr>`
  ).join('');

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: toEmail,
    subject: `✅ ReforceLife Order Confirmed — ${order.orderNumber}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#1a3a1a;padding:24px;text-align:center;">
          <h1 style="color:#fff;margin:0;">Reforce<span style="color:#5fb85f;">Life</span></h1>
        </div>
        <div style="padding:32px;">
          <h2 style="color:#1a3a1a;">Order Confirmed!</h2>
          <p>Order #: <strong>${order.orderNumber}</strong></p>
          <hr/>
          <table width="100%">${items}
            <tr><td colspan="2"><hr/></td></tr>
            <tr><td>Subtotal</td><td align="right">$${parseFloat(order.subtotal).toFixed(2)}</td></tr>
            <tr><td>Shipping</td><td align="right">$${parseFloat(order.shippingCost).toFixed(2)}</td></tr>
            <tr><td>Tax</td><td align="right">$${parseFloat(order.taxAmount).toFixed(2)}</td></tr>
            <tr><td><strong>Total</strong></td><td align="right"><strong>$${parseFloat(order.totalAmount).toFixed(2)}</strong></td></tr>
          </table>
          <hr/>
          <p style="color:#6a6a6a;font-size:13px;margin-top:32px;">
            Questions? Email us at support@reforcelife.com
          </p>
        </div>
      </div>`
  });
};

exports.sendContactNotification = async (name, email, subject, message) => {
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: process.env.MAIL_ADMIN,
    subject: `📬 New Contact: ${subject}`,
    html: `<h3>From: ${name}</h3><p>Email: ${email}</p><p>Subject: ${subject}</p><p>${message}</p>`
  });
};
