const rateLimit = require('express-rate-limit');

const createRateLimiter = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message: { message: message || 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const otpLimiter = createRateLimiter(60 * 1000, 3, 'Too many OTP requests. Please wait before trying again.');
const authLimiter = createRateLimiter(15 * 60 * 1000, 10, 'Too many authentication attempts. Please try again later.');
const generalLimiter = createRateLimiter(60 * 1000, 100, 'Too many requests. Please slow down.');

module.exports = {
  otpLimiter,
  authLimiter,
  generalLimiter,
};