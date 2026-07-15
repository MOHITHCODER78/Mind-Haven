const rateLimit = require('express-rate-limit');

const createRateLimiter = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message: { message: message || 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  // Express is configured with trust proxy: 1 in server.js
  // This allows proper IP extraction behind Render's single proxy
  // rate-limit will use req.ip which now correctly reflects the client IP
});

const otpLimiter = createRateLimiter(60 * 1000, 3, 'Too many OTP requests. Please wait before trying again.');
const authLimiter = createRateLimiter(15 * 60 * 1000, 10, 'Too many authentication attempts. Please try again later.');
const generalLimiter = createRateLimiter(60 * 1000, 100, 'Too many requests. Please slow down.');

module.exports = {
  otpLimiter,
  authLimiter,
  generalLimiter,
};