const { sendContactEmail } = require('../config/email');
const { body, validationResult } = require('express-validator');

exports.contactRules = [
  body('name').trim().notEmpty().withMessage('NAME IS REQUIRED.'),
  body('email').isEmail().withMessage('VALID EMAIL IS REQUIRED.').normalizeEmail(),
  body('message').trim().isLength({ min: 10 }).withMessage('MESSAGE MUST BE AT LEAST 10 CHARACTERS.'),
];

// POST /api/contact
exports.sendMessage = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }
    const { name, email, message } = req.body;
    await sendContactEmail({ name, email, message });
    res.json({ success: true, message: 'YOUR MESSAGE HAS BEEN RECEIVED. WE WILL RESPOND WITHIN 24 HOURS.' });
  } catch (err) {
    // Don't fail user-facing request if email fails
    console.error('[CONTACT EMAIL]', err.message);
    res.json({ success: true, message: 'MESSAGE RECEIVED. WE WILL BE IN TOUCH SHORTLY.' });
  }
};
