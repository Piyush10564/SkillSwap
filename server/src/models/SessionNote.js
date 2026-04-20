import mongoose from 'mongoose';

const sessionNoteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: false,
    default: null,
  },
  content: {
    type: String,
    required: [true, 'Note content is required'],
    maxlength: [5000, 'Note cannot exceed 5000 characters'],
  },
  tags: [{
    type: String,
    trim: true,
  }],
}, {
  timestamps: true,
});

// Index for finding notes by session
sessionNoteSchema.index({ sessionId: 1 });

// Index for finding notes by user
sessionNoteSchema.index({ userId: 1 });

const SessionNote = mongoose.model('SessionNote', sessionNoteSchema);

export default SessionNote;
