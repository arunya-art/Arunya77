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
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: { rejectUnauthorized: false }
  });
}

router.post('/', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

  const d = req.body;
  const type = d.type || 'general';
  const typeLabel = type === 'tax'        ? '💼 Tax Consultation'
                  : type === 'postpartum' ? '💜 Postpartum Live Session'
                  : type === 'recorded'   ? '🎬 Postpartum Recorded Access'
                  :                        '📩 General Inquiry';

  let dateStr = 'To be confirmed';
  if (d.meeting_time) {
    try {
      dateStr = new Date(d.meeting_time).toLocaleString('en-IN', {
        weekday: 'long', year: 'numeric', month: 'long',
        day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch(e) { dateStr = d.meeting_time; }
  }

  // Build extra rows for owner email
  const row = (label, val) => val
    ? `<tr><td style="padding:0.55rem 0;border-bottom:1px solid rgba(255,255,255,0.07);color:rgba(255,255,255,0.45);width:38%">${label}</td><td style="padding:0.55rem 0;border-bottom:1px solid rgba(255,255,255,0.07);color:#fff">${val}</td></tr>`
    : '';

  const extras = [
    row('Phone / WhatsApp', d.phone),
    row('Countries', d.countries),
    row('Meeting Format', d.meeting_type),
    row('Weeks Postpartum', d.weeks),
    row('Doctor Type', d.doctor_type),
    row('Topic', d.topic),
    row('Language', d.language),
    row('Property Type', d.property_type),
    row('Rooms', d.rooms),
    row('Location', d.location)
  ].join('');

  const ownerHtml = `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#18181c;color:#f0f0f0;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08)">
    <div style="background:linear-gradient(135deg,#0A1F44,#16213e);padding:1.75rem 2rem;text-align:center">
      <div style="font-size:2rem;font-weight:900;color:#fff;letter-spacing:-1px">FLYNQN<span style="color:#CC5500">.</span></div>
      <div style="color:rgba(255,255,255,0.4);font-size:0.78rem;margin-top:0.2rem">New Booking — Action Required</div>
    </div>
    <div style="padding:2rem">
      <div style="background:rgba(204,85,0,0.12);border:1px solid rgba(204,85,0,0.2);border-radius:10px;padding:0.85rem 1.25rem;margin-bottom:1.5rem;text-align:center;font-size:1.1rem;font-weight:bold">${typeLabel}</div>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:0.55rem 0;border-bottom:1px solid rgba(255,255,255,0.07);color:rgba(255,255,255,0.45);width:38%">Client Name</td><td style="padding:0.55rem 0;border-bottom:1px solid rgba(255,255,255,0.07);color:#fff;font-weight:bold">${d.name}</td></tr>
        <tr><td style="padding:0.55rem 0;border-bottom:1px solid rgba(255,255,255,0.07);color:rgba(255,255,255,0.45)">Client Email</td><td style="padding:0.55rem 0;border-bottom:1px solid rgba(255,255,255,0.07);color:#CC5500;font-weight:bold">${d.email}</td></tr>
        <tr><td style="padding:0.55rem 0;border-bottom:1px solid rgba(255,255,255,0.07);color:rgba(255,255,255,0.45)">Requested Time</td><td style="padding:0.55rem 0;border-bottom:1px solid rgba(255,255,255,0.07);color:#CC5500;font-weight:bold">${dateStr}</td></tr>
        ${extras}
      </table>
      ${d.message ? `<div style="margin-top:1.25rem;padding:1rem 1.25rem;background:rgba(255,255,255,0.04);border-radius:10px;border-left:3px solid #CC5500"><div style="color:rgba(255,255,255,0.35);font-size:0.7rem;text-transform:uppercase;letter-spacing:1px;margin-bottom:0.5rem">Client Message</div><div style="color:#fff;line-height:1.65;font-size:0.92rem">${d.message}</div></div>` : ''}
      <div style="margin-top:1.5rem;padding:0.9rem 1.25rem;background:rgba(204,85,0,0.07);border:1px solid rgba(204,85,0,0.15);border-radius:10px;text-align:center;font-size:0.84rem;color:rgba(255,255,255,0.55)">
        ↩ Reply to <a href="mailto:${d.email}" style="color:#CC5500;font-weight:bold">${d.email}</a> to confirm the booking
      </div>
    </div>
  </div>`;

  const clientHtml = `
  <div style="font-family:Arial,sans-serif;max-width:540px;margin:0 auto;background:#18181c;color:#f0f0f0;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08)">
    <div style="background:linear-gradient(135deg,#0A1F44,#16213e);padding:1.75rem 2rem;text-align:center">
      <div style="font-size:2rem;font-weight:900;color:#fff;letter-spacing:-1px">FLYNQN<span style="color:#CC5500">.</span></div>
      <div style="color:rgba(255,255,255,0.4);font-size:0.78rem;margin-top:0.2rem">Innovating and Inspiring Communities</div>
    </div>
    <div style="padding:2rem">
      <h2 style="color:#fff;margin:0 0 0.75rem;font-size:1.4rem">Booking Received ✅</h2>
      <p style="color:rgba(255,255,255,0.6);margin-bottom:1.5rem;line-height:1.6">Hi <strong style="color:#fff">${d.name}</strong>, thank you! Your <strong style="color:#CC5500">${typeLabel}</strong> request has been received.</p>
      <div style="background:rgba(204,85,0,0.08);border:1px solid rgba(204,85,0,0.15);border-radius:12px;padding:1.25rem;margin-bottom:1.5rem">
        <div style="color:rgba(255,255,255,0.35);font-size:0.7rem;text-transform:uppercase;letter-spacing:1px;margin-bottom:0.7rem">Your Booking</div>
        <div style="color:#fff;font-size:0.92rem;margin-bottom:0.4rem"><strong>Service:</strong> ${typeLabel}</div>
        <div style="color:#fff;font-size:0.92rem"><strong>Requested Time:</strong> <span style="color:#CC5500">${dateStr}</span></div>
      </div>
      <p style="color:rgba(255,255,255,0.55);font-size:0.88rem;line-height:1.65">Our team will confirm within <strong style="color:#fff">2 business hours</strong> and send you a meeting link.<br><br>Questions? Email us: <a href="mailto:satnamsinghama@gmail.com" style="color:#CC5500">satnamsinghama@gmail.com</a></p>
    </div>
    <div style="background:#0e0e10;padding:0.85rem;text-align:center;color:rgba(255,255,255,0.18);font-size:0.7rem">© 2025 FLYNQN · Innovating and Inspiring Communities</div>
  </div>`;

  try {
    const mailer = getTransporter();

    // Verify SMTP connection first
    await mailer.verify();

    // Send to owner
    await mailer.sendMail({
      from: `"FLYNQN" <${process.env.EMAIL_USER}>`,
      to: OWNER,
      replyTo: d.email,
      subject: `🗓️ New ${typeLabel} — ${d.name} | ${dateStr}`,
      html: ownerHtml
    });

    // Send confirmation to client
    await mailer.sendMail({
      from: `"FLYNQN" <${process.env.EMAIL_USER}>`,
      to: d.email,
      subject: `✅ FLYNQN: Your ${typeLabel} is confirmed`,
      html: clientHtml
    });

    res.json({ message: 'Booking confirmed! Check your email.' });

  } catch (err) {
  console.error("FULL MEETING ERROR:", err);
  res.status(500).json({ message: "Meeting booking failed" });
}
});

module.exports = router;
