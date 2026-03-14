const mongoose = require('mongoose');

const moodLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    moodScore: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    moodLabel: {
      type: String,
      enum: ['low', 'uneasy', 'steady', 'good', 'great'],
      required: true,
    },
    moodColor: {
      type: String,
      default: '',
      trim: true,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 280,
    },
    sentimentLabel: {
      type: String,
      enum: ['positive', 'neutral', 'negative'],
      default: 'neutral',
    },
    sentimentScore: {
      type: Number,
      default: 0,
    },
    sentimentIntensity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.MoodLog || mongoose.model('MoodLog', moodLogSchema);
