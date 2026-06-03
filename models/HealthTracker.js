const mongoose = require('mongoose');

const healthTrackerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  date: {
    type: Date,
    required: true,
    index: true,
  },
  steps: {
    type: Number,
    default: 0,
    min: 0,
  },
  stepsGoal: {
    type: Number,
    default: 10000,
    min: 0,
  },
  water: {
    type: Number, // in glasses
    default: 0,
    min: 0,
  },
  waterGoal: {
    type: Number, // in glasses
    default: 8,
    min: 0,
  },
  sleep: {
    type: Number, // in hours
    default: 0,
    min: 0,
    max: 24,
  },
  sleepGoal: {
    type: Number, // in hours
    default: 8,
    min: 0,
    max: 24,
  },
  weight: {
    type: Number, // in kg
    default: null,
    min: 0,
  },
  activeMinutes: {
    type: Number,
    default: 0,
    min: 0,
  },
  activeMinutesGoal: {
    type: Number,
    default: 60,
    min: 0,
  },
  caloriesBurned: {
    type: Number,
    default: 0,
    min: 0,
  },
  notes: {
    type: String,
    default: '',
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
healthTrackerSchema.pre('save', async function () {
  this.updatedAt = Date.now();
});

// Compound index for efficient queries
healthTrackerSchema.index({ userId: 1, date: -1 });
healthTrackerSchema.index({ userId: 1, date: 1 }, { unique: true }); // One entry per user per day

module.exports = mongoose.model('HealthTracker', healthTrackerSchema);

