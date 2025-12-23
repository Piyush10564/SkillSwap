import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Skill name is required'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Programming', 'Design', 'Language', 'Business', 'Marketing', 'Other'],
  },
  level: {
    type: String,
    required: [true, 'Level is required'],
    enum: ['Beginner', 'Intermediate', 'Expert'],
  },
  type: {
    type: String,
    required: [true, 'Type is required'],
    enum: ['offer', 'learn'],
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner is required'],
  },
  description: {
    type: String,
    default: '',
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
}, {
  timestamps: true,
});

// Indexes for faster queries
skillSchema.index({ name: 'text' });
skillSchema.index({ category: 1 });
skillSchema.index({ type: 1 });
skillSchema.index({ owner: 1 });

// Compound index for common queries
skillSchema.index({ type: 1, category: 1, level: 1 });

const Skill = mongoose.model('Skill', skillSchema);

export default Skill;
