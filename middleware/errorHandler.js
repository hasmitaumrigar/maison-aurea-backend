const errorHandler = (err, req, res, next) => {
  console.error('[ERROR]', err.stack || err.message);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const msg = Object.values(err.errors).map(e => e.message).join(', ');
    return res.status(400).json({ success: false, message: msg });
  }
  // Duplicate key (e.g. duplicate email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({ success: false, message: `${field.toUpperCase()} ALREADY EXISTS.` });
  }
  // JWT errors
  if (err.name === 'JsonWebTokenError')  return res.status(401).json({ success: false, message: 'INVALID TOKEN.' });
  if (err.name === 'TokenExpiredError')  return res.status(401).json({ success: false, message: 'SESSION EXPIRED.' });

  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'INTERNAL SERVER ERROR.',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
