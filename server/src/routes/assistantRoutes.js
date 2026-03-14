const express = require('express');
const { body } = require('express-validator');
const { respondToAssistant } = require('../controllers/assistantController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post(
  '/respond',
  protect,
  authorize('student'),
  [body('message').trim().notEmpty().withMessage('Please enter a message for the assistant.')],
  respondToAssistant
);

module.exports = router;
