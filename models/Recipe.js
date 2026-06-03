const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Recipe name is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  image: {
    type: String,
    default: '',
  },
  prepTime: {
    type: String,
    default: '',
  },
  calories: {
    type: Number,
    required: true,
    min: 0,
  },
  protein: {
    type: Number,
    required: true,
    min: 0,
  },
  carbs: {
    type: Number,
    required: true,
    min: 0,
  },
  fats: {
    type: Number,
    required: true,
    min: 0,
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Easy',
  },
  tags: {
    type: [String],
    default: [],
    index: true,
  },
  ingredients: {
    type: [String],
    default: [],
  },
  instructions: {
    type: [String],
    default: [],
  },
  servings: {
    type: Number,
    default: 1,
    min: 1,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // null for system recipes, userId for user-created
  },
  isPublic: {
    type: Boolean,
    default: true, // System recipes are public
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
recipeSchema.pre('save', async function () {
  this.updatedAt = Date.now();
});

// Index for search
recipeSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Recipe', recipeSchema);
