import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  learner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  skill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill',
  },
  skillName: {
    type: String,
  },
  message: {
    type: String,
    default: '',
    maxlength: 1000,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'cancelled'],
    default: 'pending',
  },
}, { timestamps: true });

// Index teacher for quick lookups
requestSchema.index({ teacher: 1 });

const Request = mongoose.model('Request', requestSchema);

export default Request;
