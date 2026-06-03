const mongoose = require('mongoose');

const workoutPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // null for system plans, userId for user-created
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Plan name is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  duration: {
    type: Number, // in weeks
    required: true,
    min: 1,
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner',
  },
  goal: {
    type: String,
    enum: ['weight-loss', 'muscle-gain', 'overall-fitness', 'endurance', 'flexibility'],
    required: true,
  },
  image: {
    type: String,
    default: '',
  },
  totalWorkouts: {
    type: Number,
    required: true,
    min: 1,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  isPublic: {
    type: Boolean,
    default: true, // System plans are public
  },
  workouts: [{
    week: {
      type: Number,
      required: true,
    },
    day: {
      type: Number, // 0-6 (Sunday-Saturday)
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    duration: {
      type: Number, // in minutes
      required: true,
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
    exercises: [{
      name: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        enum: ['warmup', 'exercise', 'cooldown'],
        default: 'exercise',
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
        type: String, // e.g., "5 min", "3x60s"
        default: '',
      },
      rest: {
        type: String,
        default: '',
      },
      notes: {
        type: String,
        default: '',
      },
    }],
  }],
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
workoutPlanSchema.pre('save', async function () {
  this.updatedAt = Date.now();
});

// Index for search
workoutPlanSchema.index({ name: 'text', description: 'text' });
workoutPlanSchema.index({ userId: 1, isActive: 1 });

module.exports = mongoose.model('WorkoutPlan', workoutPlanSchema);

