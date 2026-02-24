const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const axios = require("axios");

const OWNER = process.env.OWNER_EMAIL || 'satnamsinghama@gmail.com';

async function sendEmail(to, subject, html) {
  await axios.post(
    "https://api.brevo.com/v3/smtp/email",
    {
      sender: {
        name: "FLYNQN",
        email: OWNER
      },
      to: [{ email: to }],
      subject: subject,
      htmlContent: html
    },
    {
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json"
      }
    }
  );
}

router.post('/', [
  body('name').trim().notEmpty().withMessage('Name required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('message').trim().isLength({ min: 3 }).withMessage('Message too short')
], async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { name, email, service, message } = req.body;

  const ownerHtml = `
    <h2>New Contact Form</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Service:</strong> ${service || 'General'}</p>
    <p><strong>Message:</strong></p>
    <p>${message}</p>
  `;

  const clientHtml = `
    <h2>Thanks for contacting FLYNQN, ${name}!</h2>
    <p>We received your message about <strong>${service || 'your inquiry'}</strong>.</p>
    <p>We will respond within 4 business hours.</p>
  `;

  try {

    await sendEmail(
      OWNER,
      `📩 FLYNQN Contact: ${name}`,
      ownerHtml
    );

    await sendEmail(
      email,
      `FLYNQN: We received your message ✅`,
      clientHtml
    );

    res.json({ message: 'Message sent successfully!' });

  } catch (err) {
    console.error('❌ Contact API error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Email sending failed.' });
  }
});

module.exports = router;
