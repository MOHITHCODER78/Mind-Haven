const express = require('express');
const { body } = require('express-validator');
const { sendOtp, loginAdmin, loginSupport, verifyOtp, getCurrentUser } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post(
  '/send-otp',
  [
    body('email').isEmail().withMessage('Please enter a valid email address.'),
    body('name').trim().notEmpty().withMessage('Please enter your full name.'),
  ],
  sendOtp
);
router.post(
  '/admin/login',
  [
    body('email').isEmail().withMessage('Please enter a valid email address.'),
    body('password').trim().notEmpty().withMessage('Please enter your password.'),
  ],
  loginAdmin
);
router.post(
  '/support/login',
  [
    body('email').isEmail().withMessage('Please enter a valid email address.'),
    body('password').trim().notEmpty().withMessage('Please enter your password.'),
  ],
  loginSupport
);
router.post(
  '/verify-otp',
  [
    body('email').isEmail().withMessage('Please enter a valid email address.'),
    body('code').isLength({ min: 6, max: 6 }).withMessage('Please enter the 6-digit OTP.'),
    body('name').optional().trim(),
    body('role').optional().isIn(['student']).withMessage('Please select a valid role.'),
  ],
  verifyOtp
);
router.get('/me', protect, getCurrentUser);

module.exports = router;
