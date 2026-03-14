const express = require('express');
const authRoutes = require('./authRoutes');
const resourceRoutes = require('./resourceRoutes');
const moodRoutes = require('./moodRoutes');
const wallRoutes = require('./wallRoutes');
const adminRoutes = require('./adminRoutes');
const chatRoutes = require('./chatRoutes');
const assistantRoutes = require('./assistantRoutes');

const router = express.Router();

router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'Mental Health Support Platform API is running.',
  });
});

router.use('/auth', authRoutes);
router.use('/resources', resourceRoutes);
router.use('/moods', moodRoutes);
router.use('/wall', wallRoutes);
router.use('/admin', adminRoutes);
router.use('/chat', chatRoutes);
router.use('/assistant', assistantRoutes);

module.exports = router;


