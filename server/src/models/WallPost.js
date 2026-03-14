const mongoose = require('mongoose');

const wallPostSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    tag: {
      type: String,
      enum: ['exam_stress', 'anxiety', 'burnout', 'depression', 'loneliness', 'heartbreak', 'motivation', 'placements'],
      required: true,
    },
    status: {
      type: String,
      enum: ['published', 'flagged', 'hidden'],
      default: 'published',
    },
    reactions: {
      support: {
        type: Number,
        default: 0,
      },
      relate: {
        type: Number,
        default: 0,
      },
      strength: {
        type: Number,
        default: 0,
      },
    },
    reportCount: {
      type: Number,
      default: 0,
    },
    moderationReason: {
      type: String,
      default: '',
      trim: true,
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

module.exports = mongoose.models.WallPost || mongoose.model('WallPost', wallPostSchema);
