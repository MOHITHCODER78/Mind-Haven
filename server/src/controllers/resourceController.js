const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Resource = require('../models/Resource');
const MoodLog = require('../models/MoodLog');
const curatedResources = require('../data/curatedResources');

const allowedCategories = ['stress', 'exam_stress', 'anxiety', 'depression', 'suicide_support', 'heartbreak', 'motivation', 'sleep', 'burnout', 'focus'];

const recommendationRules = {
  low: ['depression', 'stress', 'motivation'],
  uneasy: ['anxiety', 'stress', 'sleep'],
  steady: ['focus', 'motivation', 'stress'],
  good: ['focus', 'motivation', 'sleep'],
  great: ['motivation', 'focus', 'stress'],
};

const keywordRules = [
  { pattern: /exam|test|assignment|deadline|study|marks|result/i, categories: ['exam_stress', 'focus', 'stress'] },
  { pattern: /anxious|panic|overthink|racing/i, categories: ['anxiety', 'sleep', 'stress'] },
  { pattern: /sleep|insomnia|awake|tired/i, categories: ['sleep', 'burnout', 'stress'] },
  { pattern: /sad|low|empty|hopeless|numb/i, categories: ['depression', 'motivation', 'stress'] },
  { pattern: /burnout|exhausted|drained|overworked/i, categories: ['burnout', 'sleep', 'stress'] },
  { pattern: /focus|concentrate|distracted|procrastinat/i, categories: ['focus', 'motivation', 'stress'] },
  { pattern: /breakup|heartbreak|rejected|love/i, categories: ['heartbreak', 'motivation', 'stress'] },
];

const buildFilter = (query) => {
  const filter = {};

  if (query.category && query.category !== 'all') {
    filter.category = query.category;
  }

  if (query.type && query.type !== 'all') {
    filter.type = query.type;
  }

  if (query.featured === 'true') {
    filter.featured = true;
  }

  if (query.search) {
    filter.$or = [
      { title: { $regex: query.search, $options: 'i' } },
      { summary: { $regex: query.search, $options: 'i' } },
      { sourceName: { $regex: query.search, $options: 'i' } },
    ];
  }

  return filter;
};

const matchesStaticFilter = (resource, query) => {
  if (query.category && query.category !== 'all' && resource.category !== query.category) {
    return false;
  }

  if (query.type && query.type !== 'all' && resource.type !== query.type) {
    return false;
  }

  if (query.featured === 'true' && !resource.featured) {
    return false;
  }

  if (query.search) {
    const needle = query.search.toLowerCase();
    const haystack = `${resource.title} ${resource.summary} ${resource.sourceName || ''}`.toLowerCase();
    return haystack.includes(needle);
  }

  return true;
};

const getValidationMessage = (req) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return null;
  }

  return errors.array()[0].msg;
};

const normalizeResource = (resource) => ({
  ...resource,
  id: resource._id ? resource._id.toString() : resource.id,
});

const getMergedResources = async (query) => {
  const staticResources = curatedResources.filter((resource) => matchesStaticFilter(resource, query)).map(normalizeResource);

  if (mongoose.connection.readyState !== 1) {
    return staticResources;
  }

  const dbResources = await Resource.find(buildFilter(query)).sort({ featured: -1, createdAt: -1 }).lean();
  const normalizedDb = dbResources.map(normalizeResource);

  return [...staticResources, ...normalizedDb];
};

const scoreCategoriesFromMoods = (logs) => {
  const scores = new Map();

  const boost = (category, amount) => {
    scores.set(category, (scores.get(category) || 0) + amount);
  };

  logs.forEach((log, index) => {
    const recencyWeight = Math.max(1, 4 - index);
    (recommendationRules[log.moodLabel] || ['stress']).forEach((category, categoryIndex) => {
      boost(category, recencyWeight * (3 - categoryIndex));
    });

    const noteText = `${log.note || ''}`;
    keywordRules.forEach((rule) => {
      if (rule.pattern.test(noteText)) {
        rule.categories.forEach((category, categoryIndex) => {
          boost(category, recencyWeight * (2 - Math.min(categoryIndex, 1)));
        });
      }
    });
  });

  if (!scores.size) {
    boost('stress', 3);
    boost('focus', 2);
    boost('motivation', 1);
  }

  return [...scores.entries()].sort((left, right) => right[1] - left[1]);
};

const buildRecommendationReason = (category, latestLog) => {
  const latestMood = latestLog?.moodLabel || 'steady';
  const categoryLabels = {
    exam_stress: 'recent academic pressure signals',
    anxiety: 'anxious or overloaded patterns',
    depression: 'low-mood check-ins',
    suicide_support: 'safety-first support needs',
    heartbreak: 'relationship-related emotional strain',
    motivation: 'confidence and momentum recovery',
    sleep: 'rest and recovery patterns',
    burnout: 'signs of exhaustion or overload',
    focus: 'concentration and attention support',
    stress: 'general stress support',
  };

  return `Recommended from your recent ${latestMood} mood trend and ${categoryLabels[category] || 'wellness patterns'}.`;
};

const getRecommendedResources = async (req, res) => {
  const allResources = await getMergedResources({});

  if (!allResources.length) {
    return res.json({ recommendations: [], categories: [] });
  }

  let logs = [];
  if (mongoose.connection.readyState === 1) {
    logs = await MoodLog.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(5).lean();
  }

  const rankedCategories = scoreCategoriesFromMoods(logs);
  const topCategories = rankedCategories.slice(0, 3).map(([category]) => category);

  const usedIds = new Set();
  const recommendations = [];

  topCategories.forEach((category) => {
    const matches = allResources
      .filter((resource) => resource.category === category)
      .sort((left, right) => Number(Boolean(right.featured)) - Number(Boolean(left.featured)) || (right.viewCount || 0) - (left.viewCount || 0))
      .slice(0, 2);

    matches.forEach((resource) => {
      if (usedIds.has(resource.id)) {
        return;
      }

      usedIds.add(resource.id);
      recommendations.push({
        ...resource,
        recommendationReason: buildRecommendationReason(category, logs[0]),
      });
    });
  });

  if (recommendations.length < 4) {
    allResources
      .filter((resource) => !usedIds.has(resource.id))
      .sort((left, right) => Number(Boolean(right.featured)) - Number(Boolean(left.featured)) || (right.viewCount || 0) - (left.viewCount || 0))
      .slice(0, 4 - recommendations.length)
      .forEach((resource) => {
        recommendations.push({
          ...resource,
          recommendationReason: 'Recommended as a strong general support resource while your pattern library grows.',
        });
      });
  }

  res.json({
    recommendations: recommendations.slice(0, 4),
    categories: topCategories,
  });
};

const getResources = async (req, res) => {
  const resources = await getMergedResources(req.query);
  res.json({ resources });
};

const getResourceById = async (req, res) => {
  const staticResource = curatedResources.find((resource) => resource.id === req.params.id);
  if (staticResource) {
    return res.json({ resource: normalizeResource(staticResource) });
  }

  if (mongoose.connection.readyState !== 1) {
    return res.status(404).json({ message: 'Resource not found.' });
  }

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: 'Resource not found.' });
  }

  const resource = await Resource.findById(req.params.id).lean();
  if (!resource) {
    return res.status(404).json({ message: 'Resource not found.' });
  }

  return res.json({ resource: normalizeResource(resource) });
};

const createResource = async (req, res) => {
  const validationMessage = getValidationMessage(req);
  if (validationMessage) {
    return res.status(400).json({ message: validationMessage });
  }

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'Database connection required to create resources.' });
  }

  const resource = await Resource.create({
    ...req.body,
    createdBy: req.user?.id || null,
  });

  return res.status(201).json({
    message: 'Resource created successfully.',
    resource: normalizeResource(resource.toObject()),
  });
};

const updateResource = async (req, res) => {
  const validationMessage = getValidationMessage(req);
  if (validationMessage) {
    return res.status(400).json({ message: validationMessage });
  }

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'Database connection required to update resources.' });
  }

  const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!resource) {
    return res.status(404).json({ message: 'Resource not found.' });
  }

  return res.json({
    message: 'Resource updated successfully.',
    resource: normalizeResource(resource.toObject()),
  });
};

const deleteResource = async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'Database connection required to delete resources.' });
  }

  const resource = await Resource.findByIdAndDelete(req.params.id);

  if (!resource) {
    return res.status(404).json({ message: 'Resource not found.' });
  }

  return res.json({ message: 'Resource deleted successfully.' });
};

module.exports = {
  allowedCategories,
  getResources,
  getResourceById,
  getRecommendedResources,
  createResource,
  updateResource,
  deleteResource,
};
