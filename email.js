const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

const OWNER = process.env.OWNER_EMAIL || 'satnamsinghama@gmail.com';
const FROM  = `"FLYNQN" <${process.env.EMAIL_FROM}>`;

// ── Owner notification: Meeting booked ──────────────────────────
async function notifyOwnerMeeting(data) {
  const { type, name, email, phone, meeting_time, meeting_type, message, ...extra } = data;
  const typeLabel = type === 'tax' ? '💼 Tax Consultation' : '💜 Postpartum Support Session';
  const html = `
    <div style="font-family:'Outfit',sans-serif;max-width:600px;margin:0 auto;background:#0e0e10;color:#f0f0f0;border-radius:16px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#0A1F44,#1a1a20);padding:2rem;text-align:center">
        <h1 style="color:#fff;font-size:1.8rem;margin:0">FLYNQN<span style="color:#CC5500">.</span></h1>
        <p style="color:rgba(255,255,255,0.5);margin:0.25rem 0 0;font-size:0.85rem">New Meeting Booking</p>
      </div>
      <div style="padding:2rem;background:#18181c">
        <div style="background:rgba(204,85,0,0.1);border:1px solid rgba(204,85,0,0.2);border-radius:12px;padding:1.25rem;margin-bottom:1.5rem;text-align:center">
          <div style="font-size:1.5rem;margin-bottom:0.4rem">${typeLabel}</div>
          <div style="color:rgba(255,255,255,0.5);font-size:0.85rem">New booking received</div>
        </div>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:0.75rem 0;border-bottom:1px solid rgba(255,255,255,0.06);color:rgba(255,255,255,0.5);width:40%">Client Name</td><td style="padding:0.75rem 0;border-bottom:1px solid rgba(255,255,255,0.06);font-weight:600;color:#fff">${name}</td></tr>
          <tr><td style="padding:0.75rem 0;border-bottom:1px solid rgba(255,255,255,0.06);color:rgba(255,255,255,0.5)">Client Email</td><td style="padding:0.75rem 0;border-bottom:1px solid rgba(255,255,255,0.06);font-weight:600;color:#CC5500">${email}</td></tr>
          <tr><td style="padding:0.75rem 0;border-bottom:1px solid rgba(255,255,255,0.06);color:rgba(255,255,255,0.5)">Phone</td><td style="padding:0.75rem 0;border-bottom:1px solid rgba(255,255,255,0.06);color:#fff">${phone || 'Not provided'}</td></tr>
          <tr><td style="padding:0.75rem 0;border-bottom:1px solid rgba(255,255,255,0.06);color:rgba(255,255,255,0.5)">Requested Date/Time</td><td style="padding:0.75rem 0;border-bottom:1px solid rgba(255,255,255,0.06);font-weight:700;color:#CC5500">${meeting_time ? new Date(meeting_time).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' }) : 'Not specified'}</td></tr>
          <tr><td style="padding:0.75rem 0;border-bottom:1px solid rgba(255,255,255,0.06);color:rgba(255,255,255,0.5)">Meeting Type</td><td style="padding:0.75rem 0;border-bottom:1px solid rgba(255,255,255,0.06);color:#fff">${meeting_type || 'Video Call'}</td></tr>
          ${type === 'tax' && extra.countries ? `<tr><td style="padding:0.75rem 0;border-bottom:1px solid rgba(255,255,255,0.06);color:rgba(255,255,255,0.5)">Countries</td><td style="padding:0.75rem 0;border-bottom:1px solid rgba(255,255,255,0.06);color:#fff">${extra.countries}</td></tr>` : ''}
          ${type === 'postpartum' && extra.weeks ? `<tr><td style="padding:0.75rem 0;border-bottom:1px solid rgba(255,255,255,0.06);color:rgba(255,255,255,0.5)">Weeks Postpartum</td><td style="padding:0.75rem 0;border-bottom:1px solid rgba(255,255,255,0.06);color:#fff">${extra.weeks}</td></tr>` : ''}
          ${type === 'postpartum' && extra.doctor_type ? `<tr><td style="padding:0.75rem 0;border-bottom:1px solid rgba(255,255,255,0.06);color:rgba(255,255,255,0.5)">Doctor Preference</td><td style="padding:0.75rem 0;border-bottom:1px solid rgba(255,255,255,0.06);color:#fff">${extra.doctor_type}</td></tr>` : ''}
        </table>
        <div style="margin-top:1.5rem;padding:1.25rem;background:rgba(255,255,255,0.04);border-radius:10px">
          <div style="color:rgba(255,255,255,0.5);font-size:0.82rem;margin-bottom:0.5rem;text-transform:uppercase;letter-spacing:1px">Client's Message</div>
          <div style="color:#fff;line-height:1.6;font-size:0.95rem">${message || 'No message provided.'}</div>
        </div>
        <div style="margin-top:1.5rem;padding:1rem;background:rgba(204,85,0,0.08);border:1px solid rgba(204,85,0,0.15);border-radius:10px;text-align:center;color:rgba(255,255,255,0.6);font-size:0.85rem">
          ⚡ Please confirm this booking by replying to <strong style="color:#CC5500">${email}</strong>
        </div>
      </div>
      <div style="background:#0e0e10;padding:1rem;text-align:center;color:rgba(255,255,255,0.2);font-size:0.75rem">FLYNQN Internal Notification · Do not reply to this email</div>
    </div>`;
  await transporter.sendMail({ from: FROM, to: OWNER, subject: `🗓️ New ${typeLabel} — ${name} | ${meeting_time ? new Date(meeting_time).toLocaleDateString() : 'Date TBD'}`, html });
}

// ── Client confirmation: Meeting booked ─────────────────────────
async function confirmClientMeeting(data) {
  const { type, name, email, meeting_time, meeting_type } = data;
  const typeLabel = type === 'tax' ? 'Tax Consultation' : 'Postpartum Support Session';
  const html = `
    <div style="font-family:'Outfit',sans-serif;max-width:560px;margin:0 auto;background:#0e0e10;color:#f0f0f0;border-radius:16px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#0A1F44,#1a1a20);padding:2rem;text-align:center">
        <h1 style="color:#fff;font-size:1.8rem;margin:0">FLYNQN<span style="color:#CC5500">.</span></h1>
        <p style="color:rgba(255,255,255,0.5);margin:0.25rem 0 0;font-size:0.85rem">Innovating and Inspiring Communities</p>
      </div>
      <div style="padding:2rem;background:#18181c">
        <h2 style="color:#fff;margin-bottom:0.5rem">Booking Confirmed ✅</h2>
        <p style="color:rgba(255,255,255,0.6);margin-bottom:1.5rem">Hi ${name}, your <strong style="color:#CC5500">${typeLabel}</strong> has been received.</p>
        <div style="background:rgba(204,85,0,0.08);border:1px solid rgba(204,85,0,0.15);border-radius:12px;padding:1.5rem;margin-bottom:1.5rem">
          <div style="color:rgba(255,255,255,0.5);font-size:0.8rem;text-transform:uppercase;letter-spacing:1px;margin-bottom:0.75rem">Booking Details</div>
          <div style="color:#fff;margin-bottom:0.5rem"><strong>Service:</strong> ${typeLabel}</div>
          <div style="color:#fff;margin-bottom:0.5rem"><strong>Requested Time:</strong> <span style="color:#CC5500">${meeting_time ? new Date(meeting_time).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' }) : 'To be confirmed'}</span></div>
          <div style="color:#fff"><strong>Format:</strong> ${meeting_type || 'Video Call'}</div>
        </div>
        <p style="color:rgba(255,255,255,0.6);font-size:0.9rem;margin-bottom:1.5rem">Our team will review your request and send you a confirmed meeting link within <strong style="color:#fff">2 business hours</strong>.</p>
        <div style="text-align:center">
          <a href="mailto:satnamsinghama@gmail.com" style="display:inline-block;background:#CC5500;color:#fff;padding:0.85rem 2rem;border-radius:50px;text-decoration:none;font-weight:700;font-size:0.95rem">Contact Support</a>
        </div>
      </div>
      <div style="background:#0e0e10;padding:1rem;text-align:center;color:rgba(255,255,255,0.2);font-size:0.75rem">© 2025 FLYNQN · Innovating and Inspiring Communities</div>
    </div>`;
  await transporter.sendMail({ from: FROM, to: email, subject: `✅ FLYNQN: Your ${typeLabel} is Booked`, html });
}

// ── Owner notification: General inquiry ─────────────────────────
async function notifyOwnerContact(data) {
  const { name, email, service, message } = data;
  const html = `
    <div style="font-family:'Outfit',sans-serif;max-width:560px;margin:0 auto;background:#18181c;color:#f0f0f0;border-radius:16px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#0A1F44,#1a1a20);padding:2rem;text-align:center">
        <h1 style="color:#fff;font-size:1.8rem;margin:0">FLYNQN<span style="color:#CC5500">.</span></h1>
        <p style="color:rgba(255,255,255,0.5);font-size:0.85rem;margin:0.25rem 0 0">New Contact Form Submission</p>
      </div>
      <div style="padding:2rem">
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:0.6rem 0;border-bottom:1px solid rgba(255,255,255,0.06);color:rgba(255,255,255,0.5);width:35%">Name</td><td style="padding:0.6rem 0;border-bottom:1px solid rgba(255,255,255,0.06);color:#fff;font-weight:600">${name}</td></tr>
          <tr><td style="padding:0.6rem 0;border-bottom:1px solid rgba(255,255,255,0.06);color:rgba(255,255,255,0.5)">Email</td><td style="padding:0.6rem 0;border-bottom:1px solid rgba(255,255,255,0.06);color:#CC5500;font-weight:600">${email}</td></tr>
          <tr><td style="padding:0.6rem 0;border-bottom:1px solid rgba(255,255,255,0.06);color:rgba(255,255,255,0.5)">Service</td><td style="padding:0.6rem 0;border-bottom:1px solid rgba(255,255,255,0.06);color:#fff">${service || 'Not specified'}</td></tr>
        </table>
        <div style="margin-top:1.25rem;padding:1.1rem;background:rgba(255,255,255,0.04);border-radius:10px">
          <div style="color:rgba(255,255,255,0.4);font-size:0.78rem;margin-bottom:0.5rem;text-transform:uppercase;letter-spacing:1px">Message</div>
          <div style="color:#fff;line-height:1.65;font-size:0.93rem">${message}</div>
        </div>
      </div>
    </div>`;
  await transporter.sendMail({ from: FROM, to: OWNER, subject: `📩 FLYNQN Contact: ${name} — ${service || 'General'}`, html });
}

// ── Auto-reply to client after contact ──────────────────────────
async function autoReplyContact(name, email) {
  const html = `
    <div style="font-family:'Outfit',sans-serif;max-width:560px;margin:0 auto;background:#18181c;color:#f0f0f0;border-radius:16px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#0A1F44,#1a1a20);padding:2rem;text-align:center">
        <h1 style="color:#fff;font-size:1.8rem;margin:0">FLYNQN<span style="color:#CC5500">.</span></h1>
      </div>
      <div style="padding:2rem">
        <h2 style="color:#fff;margin-bottom:0.75rem">Thanks for reaching out, ${name}!</h2>
        <p style="color:rgba(255,255,255,0.6);margin-bottom:1.5rem">We've received your message and will get back to you within <strong style="color:#fff">4 business hours</strong>.</p>
        <a href="https://flynq.com" style="display:inline-block;background:#CC5500;color:#fff;padding:0.85rem 2rem;border-radius:50px;text-decoration:none;font-weight:700">Visit FLYNQN</a>
      </div>
      <div style="background:#0e0e10;padding:1rem;text-align:center;color:rgba(255,255,255,0.2);font-size:0.75rem">© 2025 FLYNQN · Innovating and Inspiring Communities</div>
    </div>`;
  await transporter.sendMail({ from: FROM, to: email, subject: 'FLYNQN: We received your message ✅', html });
}

module.exports = { notifyOwnerMeeting, confirmClientMeeting, notifyOwnerContact, autoReplyContact };
