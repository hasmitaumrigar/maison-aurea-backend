const jwt  = require('jsonwebtoken');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '30d' });

const respond = (user, statusCode, res) => {
  res.status(statusCode).json({ success: true, token: signToken(user._id), user: user.toPublicJSON() });
};

// Validation rules
exports.signupRules = [
  body('name').trim().notEmpty().withMessage('NAME IS REQUIRED').isLength({ min: 2, max: 80 }),
  body('email').isEmail().withMessage('VALID EMAIL IS REQUIRED').normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('PASSWORD MUST BE AT LEAST 8 CHARACTERS.')
    .matches(/[!@#$%^&*()\-_=+\[\]{};':"\\|,.<>/?`~]/).withMessage('PASSWORD MUST CONTAIN AT LEAST ONE SPECIAL CHARACTER.'),
];

exports.loginRules = [
  body('email').isEmail().withMessage('VALID EMAIL IS REQUIRED').normalizeEmail(),
  body('password').notEmpty().withMessage('PASSWORD IS REQUIRED.'),
];

// POST /api/auth/signup
exports.signup = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }
    const { name, email, password } = req.body;
    if (await User.findOne({ email })) {
      return res.status(409).json({ success: false, message: 'AN ACCOUNT WITH THIS EMAIL ALREADY EXISTS. PLEASE SIGN IN.' });
    }
    const user = await User.create({ name, email, password });
    respond(user, 201, res);
  } catch (err) { next(err); }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'THIS ACCOUNT DOES NOT EXIST. PLEASE CREATE AN ACCOUNT FIRST.' });
    }
    if (!(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'INCORRECT PASSWORD. PLEASE TRY AGAIN.' });
    }
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    respond(user, 200, res);
  } catch (err) { next(err); }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user.toPublicJSON() });
};

// PUT /api/auth/change-password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'CURRENT PASSWORD IS INCORRECT.' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'NEW PASSWORD MUST BE AT LEAST 8 CHARACTERS.' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'PASSWORD UPDATED SUCCESSFULLY.' });
  } catch (err) { next(err); }
};
