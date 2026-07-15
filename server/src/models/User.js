const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      minlength: [8, 'Password must be at least 8 characters.'],
      default: undefined,
      select: false,
    },
    role: {
      type: String,
      enum: ['student', 'admin', 'counsellor', 'peer_mentor'],
      default: 'student',
      index: true,
    },
    avatarUrl: String,
    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    availabilityStatus: {
      type: String,
      enum: ['online', 'offline'],
      default: 'offline',
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound indexes for common queries
userSchema.index({ role: 1, availabilityStatus: 1 });
userSchema.index({ isVerified: 1, role: 1 });

userSchema.pre('save', async function save() {
  if (!this.password || !this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = function matchPassword(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
