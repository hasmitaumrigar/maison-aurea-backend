const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) token = auth.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'NOT AUTHORISED — PLEASE SIGN IN.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ success: false, message: 'USER NOT FOUND.' });
    next();
  } catch (err) {
    const msg = err.name === 'TokenExpiredError'
      ? 'SESSION EXPIRED — PLEASE SIGN IN AGAIN.'
      : 'INVALID TOKEN — PLEASE SIGN IN.';
    return res.status(401).json({ success: false, message: msg });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'ADMIN ACCESS REQUIRED.' });
  }
  next();
};

module.exports = { protect, adminOnly };
