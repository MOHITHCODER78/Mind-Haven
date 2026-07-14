const express = require('express');
const {
  getAdminOverview,
  getAdminUsers,
  getAdminResources,
  updateWallPostStatus,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/overview', protect, authorize('admin'), getAdminOverview);
router.get('/users', protect, authorize('admin'), getAdminUsers);
router.get('/resources', protect, authorize('admin'), getAdminResources);
router.patch('/wall/:id/status', protect, authorize('admin'), updateWallPostStatus);

// Temporary debugging endpoint to verify admin access
router.get('/ping', protect, authorize('admin'), (_req, res) => {
  res.json({ message: 'Admin access verified.' });
});

module.exports = router;
