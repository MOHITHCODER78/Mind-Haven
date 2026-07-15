const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');

const createRateLimiter = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message: { message: message || 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  // Use ipKeyGenerator to properly handle IPv6 addresses
  // Trust exactly 1 proxy (Render's load balancer) for correct client IP
  // This is secure because we only trust the known single proxy
  keyGenerator: ipKeyGenerator({
    trustProxy: 1,
  }),
});

const otpLimiter = createRateLimiter(60 * 1000, 3, 'Too many OTP requests. Please wait before trying again.');
const authLimiter = createRateLimiter(15 * 60 * 1000, 10, 'Too many authentication attempts. Please try again later.');
const generalLimiter = createRateLimiter(60 * 1000, 100, 'Too many requests. Please slow down.');

module.exports = {
  otpLimiter,
  authLimiter,
  generalLimiter,
};