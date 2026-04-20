import mongoose from 'mongoose';

const userBadgeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  badgeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge',
    required: true,
  },
  unlockedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Compound index to prevent duplicate badge assignments
userBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

// Index for finding badges by user
userBadgeSchema.index({ userId: 1 });

const UserBadge = mongoose.model('UserBadge', userBadgeSchema);

export default UserBadge;
