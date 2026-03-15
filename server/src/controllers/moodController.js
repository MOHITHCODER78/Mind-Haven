const mongoose = require('mongoose');
const MoodLog = require('../models/MoodLog');
const { analyzeSentiment } = require('../utils/sentiment');

const fallbackMoodHistory = [
  { id: 'm1', day: 'Mon', moodScore: 3, moodLabel: 'steady', moodColor: '#b3b08a', note: 'Got through classes without too much drift.', sentimentLabel: 'neutral', sentimentScore: 0, sentimentIntensity: 'low' },
  { id: 'm2', day: 'Tue', moodScore: 2, moodLabel: 'uneasy', moodColor: '#d6a26f', note: 'Felt rushed and mentally noisy.', sentimentLabel: 'negative', sentimentScore: -2, sentimentIntensity: 'medium' },
  { id: 'm3', day: 'Wed', moodScore: 4, moodLabel: 'good', moodColor: '#73a88b', note: 'Felt more balanced after taking breaks properly.', sentimentLabel: 'positive', sentimentScore: 2, sentimentIntensity: 'medium' },
  { id: 'm4', day: 'Thu', moodScore: 5, moodLabel: 'great', moodColor: '#2f7c71', note: 'Productive and emotionally steady today.', sentimentLabel: 'positive', sentimentScore: 2, sentimentIntensity: 'medium' },
  { id: 'm5', day: 'Fri', moodScore: 4, moodLabel: 'good', moodColor: '#73a88b', note: 'A little tired, still overall okay.', sentimentLabel: 'neutral', sentimentScore: 0, sentimentIntensity: 'low' },
  { id: 'm6', day: 'Sat', moodScore: 3, moodLabel: 'steady', moodColor: '#b3b08a', note: 'Took things slow and tried not to overload the day.', sentimentLabel: 'neutral', sentimentScore: -1, sentimentIntensity: 'low' },
  { id: 'm7', day: 'Sun', moodScore: 4, moodLabel: 'good', moodColor: '#73a88b', note: 'Reset for the week and felt clearer.', sentimentLabel: 'positive', sentimentScore: 1, sentimentIntensity: 'low' },
];

const moodMap = {
  1: { moodLabel: 'low', moodColor: '#c96b63' },
  2: { moodLabel: 'uneasy', moodColor: '#d6a26f' },
  3: { moodLabel: 'steady', moodColor: '#b3b08a' },
  4: { moodLabel: 'good', moodColor: '#73a88b' },
  5: { moodLabel: 'great', moodColor: '#2f7c71' },
};

const normalizeMoodLog = (log) => ({
  ...log,
  id: log._id ? log._id.toString() : log.id,
  day: log.day || new Date(log.createdAt).toLocaleDateString('en-US', { weekday: 'short' }),
});

const getMoodLogs = async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.json({ logs: fallbackMoodHistory, stats: { currentStreak: 5, averageMood: 3.6, sentimentSummary: { positive: 3, neutral: 3, negative: 1 } } });
  }

  const logs = await MoodLog.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(14).lean();

  if (!logs.length) {
    return res.json({ logs: [], stats: { currentStreak: 0, averageMood: 0, sentimentSummary: { positive: 0, neutral: 0, negative: 0 } } });
  }

  const normalizedLogs = logs.map(normalizeMoodLog).reverse();
  const averageMood = Number((normalizedLogs.reduce((sum, log) => sum + log.moodScore, 0) / normalizedLogs.length).toFixed(1));
  const sentimentSummary = normalizedLogs.reduce(
    (summary, log) => {
      const label = log.sentimentLabel || 'neutral';
      summary[label] += 1;
      return summary;
    },
    { positive: 0, neutral: 0, negative: 0 }
  );

  return res.json({
    logs: normalizedLogs,
    stats: {
      currentStreak: normalizedLogs.length,
      averageMood,
      sentimentSummary,
    },
  });
};

const createMoodLog = async (req, res) => {
  const { moodScore, note = '' } = req.body;
  const score = Number(moodScore);

  if (!Number.isInteger(score) || score < 1 || score > 5) {
    return res.status(400).json({ message: 'Please choose a mood score between 1 and 5.' });
  }

  const moodState = moodMap[score];
  const sentiment = analyzeSentiment(note);

  if (mongoose.connection.readyState !== 1) {
    return res.status(201).json({
      message: 'Mood log recorded.',
      log: {
        id: `demo-mood-${Date.now()}`,
        moodScore: score,
        moodLabel: moodState.moodLabel,
        moodColor: moodState.moodColor,
        note,
        day: new Date().toLocaleDateString('en-US', { weekday: 'short' }),
        sentimentLabel: sentiment.label,
        sentimentScore: sentiment.score,
        sentimentIntensity: sentiment.intensity,
      },
    });
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(todayStart.getDate() + 1);

  let moodLog = await MoodLog.findOne({
    user: req.user.id,
    createdAt: {
      $gte: todayStart,
      $lt: tomorrowStart,
    },
  });

  if (moodLog) {
    moodLog.moodScore = score;
    moodLog.moodLabel = moodState.moodLabel;
    moodLog.moodColor = moodState.moodColor;
    moodLog.note = note;
    moodLog.sentimentLabel = sentiment.label;
    moodLog.sentimentScore = sentiment.score;
    moodLog.sentimentIntensity = sentiment.intensity;
    await moodLog.save();
  } else {
    moodLog = await MoodLog.create({
      user: req.user.id,
      moodScore: score,
      moodLabel: moodState.moodLabel,
      moodColor: moodState.moodColor,
      note,
      sentimentLabel: sentiment.label,
      sentimentScore: sentiment.score,
      sentimentIntensity: sentiment.intensity,
    });
  }

  return res.status(201).json({
    message: 'Mood log recorded.',
    log: normalizeMoodLog(moodLog.toObject()),
  });
};

module.exports = {
  getMoodLogs,
  createMoodLog,
};
