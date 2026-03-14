const mongoose = require('mongoose');
const User = require('../models/User');
const Resource = require('../models/Resource');
const WallPost = require('../models/WallPost');
const MoodLog = require('../models/MoodLog');

const fallbackOverview = {
  metrics: {
    totalUsers: 18,
    adminUsers: 1,
    totalResources: 12,
    flaggedPosts: 3,
    totalMoodLogs: 27,
  },
  flaggedPosts: [
    { id: 'demo-1', tag: 'depression', excerpt: 'This post needs manual support review.', reportCount: 2 },
  ],
  roleBreakdown: [
    { label: 'Students', value: 14 },
    { label: 'Admins', value: 1 },
    { label: 'Counsellors', value: 2 },
    { label: 'Peer mentors', value: 1 },
  ],
  topResources: [
    { title: 'The 5-Minute Reset for Exam Stress', sourceName: 'Mind Haven Editorial', viewCount: 184, category: 'exam_stress' },
    { title: 'Working Through Anxiety on Campus Without Hiding It', sourceName: 'Mind Haven Editorial', viewCount: 166, category: 'anxiety' },
    { title: 'Doing What Matters in Times of Stress', sourceName: 'WHO', viewCount: 148, category: 'stress' },
  ],
};

const getAdminOverview = async (_req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.json(fallbackOverview);
  }

  const [totalUsers, adminUsers, counsellors, peerMentors, totalResources, flaggedPosts, totalMoodLogs, topResources] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'admin' }),
    User.countDocuments({ role: 'counsellor' }),
    User.countDocuments({ role: 'peer_mentor' }),
    Resource.countDocuments(),
    WallPost.find({ status: 'flagged' }).sort({ reportCount: -1, updatedAt: -1 }).limit(6).lean(),
    MoodLog.countDocuments(),
    Resource.find().sort({ viewCount: -1, featured: -1 }).limit(5).lean(),
  ]);

  const students = Math.max(totalUsers - adminUsers - counsellors - peerMentors, 0);

  return res.json({
    metrics: {
      totalUsers,
      adminUsers,
      totalResources,
      flaggedPosts: flaggedPosts.length,
      totalMoodLogs,
    },
    flaggedPosts: flaggedPosts.map((post) => ({
      id: post._id.toString(),
      tag: post.tag,
      excerpt: post.content.slice(0, 120),
      reportCount: post.reportCount,
      moderationReason: post.moderationReason,
    })),
    roleBreakdown: [
      { label: 'Students', value: students },
      { label: 'Admins', value: adminUsers },
      { label: 'Counsellors', value: counsellors },
      { label: 'Peer mentors', value: peerMentors },
    ],
    topResources: topResources.map((resource) => ({
      id: resource._id.toString(),
      title: resource.title,
      sourceName: resource.sourceName,
      viewCount: resource.viewCount,
      category: resource.category,
      internal: resource.internal,
      url: resource.url,
    })),
  });
};

const getAdminUsers = async (_req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.json({ users: [] });
  }

  const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();
  return res.json({
    users: users.map((user) => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    })),
  });
};

const getAdminResources = async (_req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.json({ resources: [] });
  }

  const resources = await Resource.find().sort({ featured: -1, createdAt: -1 }).lean();
  return res.json({
    resources: resources.map((resource) => ({
      id: resource._id.toString(),
      title: resource.title,
      category: resource.category,
      type: resource.type,
      sourceName: resource.sourceName,
      featured: resource.featured,
      internal: resource.internal,
      viewCount: resource.viewCount,
      summary: resource.summary,
      url: resource.url,
    })),
  });
};

const updateWallPostStatus = async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'Database connection required to moderate posts.' });
  }

  const { status } = req.body;
  if (!['published', 'hidden', 'flagged'].includes(status)) {
    return res.status(400).json({ message: 'Please choose a valid moderation status.' });
  }

  const post = await WallPost.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: 'Post not found.' });
  }

  post.status = status;
  if (status === 'published') {
    post.moderationReason = '';
    post.reportCount = 0;
  }
  await post.save();

  return res.json({ message: 'Post moderation status updated.' });
};

module.exports = {
  getAdminOverview,
  getAdminUsers,
  getAdminResources,
  updateWallPostStatus,
};
