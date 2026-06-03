const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Meal name is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  type: {
    type: String,
    required: true,
    enum: ['breakfast', 'mid-morning-snack', 'lunch', 'afternoon-snack', 'dinner', 'evening-snack'],
    index: true,
  },
  date: {
    type: Date,
    required: true,
    index: true,
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
  image: {
    type: String,
    default: '',
  },
  time: {
    type: String,
    default: '',
  },
  logged: {
    type: Boolean,
    default: true,
  },
  isCustom: {
    type: Boolean,
    default: true, // User-created meals are custom by default
  },
  recipeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
    default: null, // If meal is based on a recipe
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
mealSchema.pre('save', async function () {
  this.updatedAt = Date.now();
});

// Index for efficient queries
mealSchema.index({ userId: 1, date: -1 });
mealSchema.index({ userId: 1, date: 1, type: 1 });

module.exports = mongoose.model('Meal', mealSchema);
