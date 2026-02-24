const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const t = req.headers.authorization?.split(' ')[1];
    if (!t) return res.status(401).json({ message: 'Not authorized' });
    const decoded = jwt.verify(t, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch { res.status(401).json({ message: 'Token expired' }); }
};

router.get('/dashboard', protect, (req, res) => {
  res.json({ user: req.user, stats: { consultations: req.user.consultationHistory?.length || 0, savedServices: req.user.savedServices?.length || 0, botInteractions: req.user.botInteractions?.length || 0 } });
});

module.exports = router;
