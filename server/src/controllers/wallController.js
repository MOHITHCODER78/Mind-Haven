const mongoose = require('mongoose');
const WallPost = require('../models/WallPost');
const fallbackWallPosts = require('../data/fallbackWallPosts');
const { analyzeSentiment } = require('../utils/sentiment');

const allowedTags = ['exam_stress', 'anxiety', 'burnout', 'depression', 'loneliness', 'heartbreak', 'motivation', 'placements'];

const flaggedKeywords = [
  'suicide',
  'kill myself',
  'end my life',
  'self harm',
  'self-harm',
  'want to die',
];

const normalizePost = (post) => ({
  ...post,
  id: post._id ? post._id.toString() : post.id,
  createdAtLabel: post.createdAtLabel || new Date(post.createdAt).toLocaleString(),
  sentimentLabel: post.sentimentLabel || 'neutral',
  sentimentScore: post.sentimentScore || 0,
  sentimentIntensity: post.sentimentIntensity || 'low',
});

const containsRiskyLanguage = (content) => {
  const lowerContent = content.toLowerCase();
  return flaggedKeywords.some((keyword) => lowerContent.includes(keyword));
};

const getWallPosts = async (req, res) => {
  const tag = req.query.tag;

  if (mongoose.connection.readyState !== 1) {
    const posts = tag && tag !== 'all' ? fallbackWallPosts.filter((post) => post.tag === tag) : fallbackWallPosts;
    return res.json({ posts });
  }

  const filter = { status: 'published' };
  if (tag && tag !== 'all') {
    filter.tag = tag;
  }

  const posts = await WallPost.find(filter).sort({ createdAt: -1 }).lean();

  if (!posts.length) {
    const fallback = tag && tag !== 'all' ? fallbackWallPosts.filter((post) => post.tag === tag) : fallbackWallPosts;
    return res.json({ posts: fallback });
  }

  return res.json({ posts: posts.map(normalizePost) });
};

const createWallPost = async (req, res) => {
  const { content, tag } = req.body;

  if (!content?.trim()) {
    return res.status(400).json({ message: 'Please write something before posting.' });
  }

  if (!allowedTags.includes(tag)) {
    return res.status(400).json({ message: 'Please choose a valid feeling tag.' });
  }

  const riskyContent = containsRiskyLanguage(content);
  const sentiment = analyzeSentiment(content);

  if (mongoose.connection.readyState !== 1) {
    return res.status(201).json({
      message: riskyContent
        ? 'Your post was received and marked for review.'
        : 'Your anonymous post was shared successfully.',
      post: {
        id: `demo-${Date.now()}`,
        content,
        tag,
        status: riskyContent ? 'flagged' : 'published',
        reactions: { support: 0, relate: 0, strength: 0 },
        createdAtLabel: 'Just now',
        sentimentLabel: sentiment.label,
        sentimentScore: sentiment.score,
        sentimentIntensity: sentiment.intensity,
      },
    });
  }

  const post = await WallPost.create({
    user: req.user.id,
    content: content.trim(),
    tag,
    status: riskyContent ? 'flagged' : 'published',
    moderationReason: riskyContent ? 'Needs safety review' : '',
    sentimentLabel: sentiment.label,
    sentimentScore: sentiment.score,
    sentimentIntensity: sentiment.intensity,
  });

  return res.status(201).json({
    message: riskyContent
      ? 'Your post was received and marked for review.'
      : 'Your anonymous post was shared successfully.',
    post: normalizePost(post.toObject()),
  });
};

const reactToWallPost = async (req, res) => {
  const { reaction } = req.body;
  if (!['support', 'relate', 'strength'].includes(reaction)) {
    return res.status(400).json({ message: 'Please choose a valid reaction.' });
  }

  if (mongoose.connection.readyState !== 1) {
    return res.json({ message: 'Reaction received.' });
  }

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'This post cannot receive reactions yet. Please refresh the wall.' });
  }

  const post = await WallPost.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: 'Post not found.' });
  }

  post.reactions[reaction] += 1;
  await post.save();

  return res.json({
    message: 'Reaction added.',
    post: normalizePost(post.toObject()),
  });
};

const reportWallPost = async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.json({ message: 'Report submitted for review.' });
  }

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'This post cannot be reported yet. Please refresh the wall.' });
  }

  const post = await WallPost.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: 'Post not found.' });
  }

  post.reportCount += 1;
  if (post.reportCount >= 2 && post.status === 'published') {
    post.status = 'flagged';
    post.moderationReason = 'Community report threshold reached';
  }
  await post.save();

  return res.json({
    message: post.status === 'flagged' ? 'Report submitted. This post is now under review.' : 'Report submitted for review.',
  });
};

module.exports = {
  getWallPosts,
  createWallPost,
  reactToWallPost,
  reportWallPost,
};
