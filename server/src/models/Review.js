import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    default: '',
    maxlength: [1000, 'Comment cannot exceed 1000 characters'],
  },
}, {
  timestamps: true,
});

// Compound index to prevent duplicate reviews for same session
reviewSchema.index({ reviewerId: 1, receiverId: 1, sessionId: 1 }, { unique: true });

// Index for finding reviews by receiver
reviewSchema.index({ receiverId: 1 });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
