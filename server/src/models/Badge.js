import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Badge name is required'],
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Badge description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  icon: {
    type: String,
    required: [true, 'Badge icon is required'],
  },
  criteria: {
    type: {
      type: String,
      enum: ['sessions', 'rating', 'reviews', 'credits', 'skills'],
    },
    value: Number,
  },
}, {
  timestamps: true,
});

const Badge = mongoose.model('Badge', badgeSchema);

export default Badge;
