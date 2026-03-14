const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
      maxlength: 280,
    },
    category: {
      type: String,
      enum: ['stress', 'exam_stress', 'anxiety', 'depression', 'suicide_support', 'heartbreak', 'motivation', 'sleep', 'burnout', 'focus'],
      required: true,
    },
    type: {
      type: String,
      enum: ['article', 'video', 'guide'],
      default: 'article',
    },
    url: {
      type: String,
      trim: true,
    },
    videoUrl: {
      type: String,
      trim: true,
      default: '',
    },
    thumbnailUrl: {
      type: String,
      trim: true,
      default: '',
    },
    sourceName: {
      type: String,
      trim: true,
      default: '',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    internal: {
      type: Boolean,
      default: false,
    },
    readTime: {
      type: String,
      default: '',
      trim: true,
    },
    content: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Resource || mongoose.model('Resource', resourceSchema);
