import mongoose from 'mongoose';

const progressTrackingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  skillId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill',
    required: true,
  },
  completedSessions: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalHoursLearned: {
    type: Number,
    default: 0,
    min: 0,
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  lastSessionDate: {
    type: Date,
    default: null,
  },
  milestone: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'beginner',
  },
}, {
  timestamps: true,
});

// Compound index to prevent duplicate entries
progressTrackingSchema.index({ userId: 1, skillId: 1 }, { unique: true });

// Index for finding progress by user
progressTrackingSchema.index({ userId: 1 });

const ProgressTracking = mongoose.model('ProgressTracking', progressTrackingSchema);

export default ProgressTracking;
