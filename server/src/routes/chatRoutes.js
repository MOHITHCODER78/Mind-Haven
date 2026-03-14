const express = require('express');
const { body } = require('express-validator');
const {
  getConversations,
  createConversation,
  getMessages,
  createMessage,
  updateConversationStatus,
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/conversations', getConversations);
router.post(
  '/conversations',
  [
    body('topic').trim().notEmpty().withMessage('Please enter a conversation topic.'),
    body('assignedRole').optional().isIn(['counsellor', 'peer_mentor']).withMessage('Please choose a valid support role.'),
  ],
  createConversation
);
router.get('/conversations/:id/messages', getMessages);
router.post('/conversations/:id/messages', [body('content').trim().notEmpty()], createMessage);
router.patch('/conversations/:id/status', [body('status').isIn(['open', 'closed'])], updateConversationStatus);

module.exports = router;
