const express = require('express');
const { body } = require('express-validator');
const {
  getWallPosts,
  createWallPost,
  reactToWallPost,
  reportWallPost,
} = require('../controllers/wallController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

router.get('/', getWallPosts);
router.post(
  '/',
  protect,
  [
    body('content').trim().notEmpty().withMessage('Please write something before posting.'),
    body('tag')
      .isIn(['exam_stress', 'anxiety', 'burnout', 'depression', 'loneliness', 'heartbreak', 'motivation', 'placements'])
      .withMessage('Please choose a valid feeling tag.'),
  ],
  validate,
  createWallPost
);
router.post('/:id/react', protect, [body('reaction').notEmpty()], validate, reactToWallPost);
router.post('/:id/report', protect, reportWallPost);

module.exports = router;
