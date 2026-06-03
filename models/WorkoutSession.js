const mongoose = require('mongoose');

const workoutSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  workoutPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkoutPlan',
    default: null,
  },
  workoutName: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
    index: true,
  },
  duration: {
    type: Number, // in minutes
    default: 0,
  },
  calories: {
    type: Number,
    default: 0,
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner',
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'skipped'],
    default: 'scheduled',
  },
  exercises: [{
    name: {
      type: String,
      required: true,
    },
    sets: {
      type: String,
      default: '',
    },
    reps: {
      type: String,
      default: '',
    },
    duration: {
      type: String,
      default: '',
    },
    completed: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      default: '',
    },
  }],
  startedAt: {
    type: Date,
    default: null,
  },
  completedAt: {
    type: Date,
    default: null,
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
workoutSessionSchema.pre('save', async function () {
  this.updatedAt = Date.now();
});

// Index for efficient queries
workoutSessionSchema.index({ userId: 1, date: -1 });
workoutSessionSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('WorkoutSession', workoutSessionSchema);

