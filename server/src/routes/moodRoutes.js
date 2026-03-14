const express = require('express');
const { getMoodLogs, createMoodLog } = require('../controllers/moodController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getMoodLogs);
router.post('/', protect, createMoodLog);

module.exports = router;
