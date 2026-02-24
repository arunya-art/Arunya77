require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
const path = require('path');

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*', credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 150 }));
app.use('/api/auth/', rateLimit({ windowMs: 60 * 60 * 1000, max: 20 }));

// Serve all HTML/CSS/JS from same directory
app.use(express.static(__dirname));

// API Routes — all in same flat folder now
app.use('/api/auth',    require('./auth'));
app.use('/api/meeting', require('./meeting'));
app.use('/api/contact', require('./contact'));
app.use('/api/users',   require('./users'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'FLYNQN API v2' }));

// Catch-all → index.html
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'index.html'));
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, '0.0.0.0', () => console.log(`🚀 FLYNQN running on port ${PORT}`));
  })
  .catch(err => { console.error('❌ MongoDB error:', err.message); process.exit(1); });

module.exports = app;
