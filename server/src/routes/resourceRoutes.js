const express = require('express');
const { body } = require('express-validator');
const {
  allowedCategories,
  getResources,
  getResourceById,
  getRecommendedResources,
  createResource,
  updateResource,
  deleteResource,
} = require('../controllers/resourceController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

const resourceValidators = [
  body('title').trim().notEmpty().withMessage('Title is required.'),
  body('summary').trim().notEmpty().withMessage('Summary is required.'),
  body('category').isIn(allowedCategories).withMessage('Please select a valid category.'),
  body('type').isIn(['article', 'video', 'guide']).withMessage('Please select a valid resource type.'),
  body('url').optional({ values: 'falsy' }).isURL().withMessage('Please enter a valid URL.'),
  body('videoUrl').optional({ values: 'falsy' }).isURL().withMessage('Please enter a valid video URL.'),
  body('thumbnailUrl').optional({ values: 'falsy' }).isURL().withMessage('Please enter a valid thumbnail URL.'),
  body('featured').optional().isBoolean().withMessage('Featured must be true or false.'),
  body('sourceName').optional().isString(),
  body('readTime').optional().isString(),
  body('internal').optional().isBoolean(),
  body('content').optional().isArray(),
];

router.get('/', getResources);
router.get('/recommendations', protect, authorize('student'), getRecommendedResources);
router.get('/:id', getResourceById);
router.post('/', protect, authorize('admin'), resourceValidators, createResource);
router.put('/:id', protect, authorize('admin'), resourceValidators, updateResource);
router.delete('/:id', protect, authorize('admin'), deleteResource);

module.exports = router;
