const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Device name is required'],
    trim: true,
  },
  type: {
    type: String,
    enum: ['apple-watch', 'fitbit', 'garmin', 'samsung-health', 'google-fit', 'other'],
    required: true,
  },
  deviceId: {
    type: String,
    required: true,
    trim: true,
  },
  accessToken: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: String,
    default: '',
  },
  isConnected: {
    type: Boolean,
    default: true,
  },
  lastSynced: {
    type: Date,
    default: null,
  },
  syncSettings: {
    steps: { type: Boolean, default: true },
    heartRate: { type: Boolean, default: true },
    sleep: { type: Boolean, default: true },
    workouts: { type: Boolean, default: true },
    weight: { type: Boolean, default: true },
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {},
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

deviceSchema.pre('save', function () {
  this.updatedAt = Date.now();
});

deviceSchema.index({ userId: 1, deviceId: 1 }, { unique: true });

module.exports = mongoose.model('Device', deviceSchema);

