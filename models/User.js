const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false, // Don't return password by default
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  onboardingCompleted: {
    type: Boolean,
    default: false,
  },
  onboardingData: {
    age: Number,
    gender: String,
    height: Number, // in cm
    weight: Number, // in kg
    activityLevel: String,
    goal: String,
    medicalConditions: [String],
    dietaryRestrictions: [String],
    sleepHours: Number,
    stressLevel: String,
    waterIntake: Number,
    notes: String,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  notificationPreferences: {
    workoutReminders: { type: Boolean, default: true },
    mealReminders: { type: Boolean, default: true },
    progressUpdates: { type: Boolean, default: true },
    weeklyReports: { type: Boolean, default: true },
    motivationalMessages: { type: Boolean, default: true },
    communityUpdates: { type: Boolean, default: false },
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

// Hash password and update updatedAt before saving
userSchema.pre('save', async function () {
  // Update the updatedAt field
  this.updatedAt = Date.now();

  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return;
  }

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

// Method to compare password for login
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);




