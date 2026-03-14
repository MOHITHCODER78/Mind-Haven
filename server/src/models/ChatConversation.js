const mongoose = require('mongoose');

const chatConversationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedRole: {
      type: String,
      enum: ['counsellor', 'peer_mentor'],
      default: 'counsellor',
    },
    assignedSupport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    topic: {
      type: String,
      trim: true,
      required: true,
    },
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open',
    },
    closedByRole: {
      type: String,
      enum: ['student', 'admin', 'counsellor', 'peer_mentor', ''],
      default: '',
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    unreadForStudent: {
      type: Number,
      default: 0,
    },
    unreadForSupport: {
      type: Number,
      default: 0,
    },
    lastMessagePreview: {
      type: String,
      trim: true,
      default: '',
      maxlength: 180,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.ChatConversation || mongoose.model('ChatConversation', chatConversationSchema);
