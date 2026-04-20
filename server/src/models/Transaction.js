import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['earn', 'spend'],
    required: true,
  },
  credits: {
    type: Number,
    required: true,
    min: 0,
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
  },
  description: {
    type: String,
    default: '',
  },
  balance: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Index for finding transactions by user
transactionSchema.index({ userId: 1 });
transactionSchema.index({ createdAt: -1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
