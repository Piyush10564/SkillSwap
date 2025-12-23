import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  },
  unreadCounts: {
    type: Map,
    of: Number,
    default: {},
  },
}, {
  timestamps: true,
});

// Ensure exactly 2 participants for now (1:1 conversations)
conversationSchema.pre('save', function(next) {
  if (this.participants.length !== 2) {
    return next(new Error('Conversation must have exactly 2 participants'));
  }
  next();
});

// Index for finding conversations by participant
conversationSchema.index({ participants: 1 });

// Method to increment unread count for a user
conversationSchema.methods.incrementUnread = function(userId) {
  const currentCount = this.unreadCounts.get(userId.toString()) || 0;
  this.unreadCounts.set(userId.toString(), currentCount + 1);
  return this.save();
};

// Method to reset unread count for a user
conversationSchema.methods.resetUnread = function(userId) {
  this.unreadCounts.set(userId.toString(), 0);
  return this.save();
};

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
