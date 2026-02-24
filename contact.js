const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');

const OWNER = process.env.OWNER_EMAIL || 'satnamsinghama@gmail.com';

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    tls: { rejectUnauthorized: false }
  });
}

router.post('/', [
  body('name').trim().notEmpty().withMessage('Name required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('message').trim().isLength({ min: 3 }).withMessage('Message too short')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

  const { name, email, service, message, phone, rooms, location, property_type } = req.body;

  const extras = [
    phone         ? `<tr><td style="padding:0.5rem 0;border-bottom:1px solid rgba(255,255,255,0.07);color:rgba(255,255,255,0.4)">Phone</td><td style="padding:0.5rem 0;border-bottom:1px solid rgba(255,255,255,0.07);color:#fff">${phone}</td></tr>` : '',
    rooms         ? `<tr><td style="padding:0.5rem 0;border-bottom:1px solid rgba(255,255,255,0.07);color:rgba(255,255,255,0.4)">Rooms</td><td style="padding:0.5rem 0;border-bottom:1px solid rgba(255,255,255,0.07);color:#fff">${rooms}</td></tr>` : '',
    location      ? `<tr><td style="padding:0.5rem 0;border-bottom:1px solid rgba(255,255,255,0.07);color:rgba(255,255,255,0.4)">Location</td><td style="padding:0.5rem 0;border-bottom:1px solid rgba(255,255,255,0.07);color:#fff">${location}</td></tr>` : '',
    property_type ? `<tr><td style="padding:0.5rem 0;border-bottom:1px solid rgba(255,255,255,0.07);color:rgba(255,255,255,0.4)">Property</td><td style="padding:0.5rem 0;border-bottom:1px solid rgba(255,255,255,0.07);color:#fff">${property_type}</td></tr>` : ''
  ].join('');

  const ownerHtml = `
  <div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;background:#18181c;color:#f0f0f0;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.07)">
    <div style="background:linear-gradient(135deg,#0A1F44,#16213e);padding:1.5rem 2rem;text-align:center">
      <div style="font-size:1.8rem;font-weight:900;color:#fff">FLYNQN<span style="color:#CC5500">.</span></div>
      <div style="color:rgba(255,255,255,0.4);font-size:0.75rem;margin-top:0.2rem">New Contact Form Submission</div>
    </div>
    <div style="padding:1.75rem">
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:0.5rem 0;border-bottom:1px solid rgba(255,255,255,0.07);color:rgba(255,255,255,0.4);width:35%">Name</td><td style="padding:0.5rem 0;border-bottom:1px solid rgba(255,255,255,0.07);color:#fff;font-weight:bold">${name}</td></tr>
        <tr><td style="padding:0.5rem 0;border-bottom:1px solid rgba(255,255,255,0.07);color:rgba(255,255,255,0.4)">Email</td><td style="padding:0.5rem 0;border-bottom:1px solid rgba(255,255,255,0.07);color:#CC5500;font-weight:bold">${email}</td></tr>
        <tr><td style="padding:0.5rem 0;border-bottom:1px solid rgba(255,255,255,0.07);color:rgba(255,255,255,0.4)">Service</td><td style="padding:0.5rem 0;border-bottom:1px solid rgba(255,255,255,0.07);color:#fff">${service || 'General'}</td></tr>
        ${extras}
      </table>
      <div style="margin-top:1.25rem;padding:1rem;background:rgba(255,255,255,0.04);border-radius:10px;border-left:3px solid #CC5500">
        <div style="color:rgba(255,255,255,0.3);font-size:0.68rem;text-transform:uppercase;letter-spacing:1px;margin-bottom:0.4rem">Message</div>
        <div style="color:#fff;line-height:1.65;font-size:0.9rem">${message}</div>
      </div>
    </div>
  </div>`;

  const clientHtml = `
  <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#18181c;color:#f0f0f0;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.07)">
    <div style="background:linear-gradient(135deg,#0A1F44,#16213e);padding:1.5rem 2rem;text-align:center">
      <div style="font-size:1.8rem;font-weight:900;color:#fff">FLYNQN<span style="color:#CC5500">.</span></div>
    </div>
    <div style="padding:1.75rem">
      <h2 style="color:#fff;margin:0 0 0.65rem;font-size:1.3rem">Thanks for reaching out, ${name}! 👋</h2>
      <p style="color:rgba(255,255,255,0.6);line-height:1.6;margin-bottom:1.5rem">We received your message about <strong style="color:#fff">${service || 'your inquiry'}</strong> and will get back to you within <strong style="color:#CC5500">4 business hours</strong>.</p>
      <a href="https://flynqn.com" style="display:inline-block;background:#CC5500;color:#fff;padding:0.8rem 1.75rem;border-radius:50px;text-decoration:none;font-weight:bold;font-size:0.9rem">Visit FLYNQN</a>
    </div>
    <div style="background:#0e0e10;padding:0.75rem;text-align:center;color:rgba(255,255,255,0.18);font-size:0.68rem">© 2025 FLYNQN · Innovating and Inspiring Communities</div>
  </div>`;

  try {
    const mailer = getTransporter();
    await mailer.verify();
    await mailer.sendMail({ from: `"FLYNQN" <${process.env.EMAIL_USER}>`, to: OWNER, replyTo: email, subject: `📩 FLYNQN Contact: ${name} — ${service || 'General'}`, html: ownerHtml });
    await mailer.sendMail({ from: `"FLYNQN" <${process.env.EMAIL_USER}>`, to: email, subject: `FLYNQN: We received your message ✅`, html: clientHtml });
    res.json({ message: 'Message sent!' });
  } catch (err) {
    console.error('❌ Contact email error:', err.message);
    res.status(500).json({ message: 'Email sending failed. Please contact us at satnamsinghama@gmail.com' });
  }
});

module.exports = router;
