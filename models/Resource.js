const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['article', 'video'],
    index: true,
  },
  category: {
    type: String,
    required: true,
    enum: [
      'fitness',
      'nutrition',
      'health-education',
      'wellness',
      'workout-guides',
      'meal-planning',
      'mental-health',
      'disease-prevention',
    ],
    index: true,
  },
  content: {
    // For articles: full article content (markdown or HTML)
    // For videos: video URL or embed code
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
    default: '',
  },
  videoUrl: {
    type: String,
    // Only required for video type
    validate: {
      validator: function(v) {
        if (this.type === 'video') {
          return v && v.length > 0;
        }
        return true;
      },
      message: 'Video URL is required for video resources',
    },
  },
  duration: {
    // For videos: duration in minutes
    // For articles: reading time in minutes
    type: Number,
    default: 0,
  },
  author: {
    type: String,
    default: 'Medifit AI Team',
  },
  tags: {
    type: [String],
    default: [],
    index: true,
  },
  featured: {
    type: Boolean,
    default: false,
    index: true,
  },
  views: {
    type: Number,
    default: 0,
  },
  likes: {
    type: Number,
    default: 0,
  },
  published: {
    type: Boolean,
    default: true,
    index: true,
  },
  publishedAt: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update updatedAt before saving
resourceSchema.pre('save', async function () {
  this.updatedAt = Date.now();
});

// Index for search
resourceSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Resource', resourceSchema);

