const express = require('express');
const { body } = require('express-validator');
const mongoose = require('mongoose');
const { sendOtp, loginAdmin, loginSupport, verifyOtp, getCurrentUser } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { otpLimiter, authLimiter } = require('../middleware/rateLimiter');
const { validate } = require('../middleware/validationMiddleware');
const RefreshToken = require('../models/RefreshToken');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post('/send-otp', otpLimiter, [
  body('email').isEmail().withMessage('Please enter a valid email address.'),
  body('name').trim().notEmpty().withMessage('Please enter your full name.'),
], validate, sendOtp);
router.post('/admin/login', authLimiter, [
  body('email').isEmail().withMessage('Please enter a valid email address.'),
  body('password').trim().notEmpty().withMessage('Please enter your password.'),
], validate, loginAdmin);
router.post('/support/login', authLimiter, [
  body('email').isEmail().withMessage('Please enter a valid email address.'),
  body('password').trim().notEmpty().withMessage('Please enter your password.'),
], validate, loginSupport);
router.post('/verify-otp', authLimiter, [
  body('email').isEmail().withMessage('Please enter a valid email address.'),
  body('code').isLength({ min: 6, max: 6 }).withMessage('Please enter the 6-digit OTP.'),
  body('name').optional().trim(),
  body('role').optional().isIn(['student']).withMessage('Please select a valid role.'),
], validate, verifyOtp);
router.get('/me', protect, getCurrentUser);

router.post('/refresh-token', async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    return res.status(401).json({ message: 'No refresh token provided.' });
  }

  try {
    const refreshDoc = await RefreshToken.findOne({ token }).populate('user');
    if (!refreshDoc || !refreshDoc.user) {
      return res.status(403).json({ message: 'Invalid refresh token or user not found.' });
    }

    if (refreshDoc.expiresAt.getTime() < Date.now()) {
      await RefreshToken.deleteOne({ _id: refreshDoc._id });
      return res.status(403).json({ message: 'Refresh token expired.' });
    }

    const user = refreshDoc.user;
    const newAccessToken = jwt.sign(
      { id: user._id.toString(), name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.json({
      token: newAccessToken,
      user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    return res.status(500).json({ message: 'Token refresh failed.' });
  }
});

router.post('/logout', protect, async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (token && mongoose.connection.readyState === 1) {
    try {
      await RefreshToken.deleteOne({ token });
    } catch (_err) {
      // Do not block cookie clearing
    }
  }

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  return res.json({ message: 'Logged out successfully.' });
});

module.exports = router;
