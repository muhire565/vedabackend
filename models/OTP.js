const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true, // For faster lookups
  },
  code: {
    type: String,
    required: true,
  },
  purpose: {
    type: String,
    enum: ['email_verification', 'password_reset'],
    default: 'email_verification',
    index: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // Auto-delete expired documents
  },
  verified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries
otpSchema.index({ email: 1, purpose: 1, verified: 1 });

module.exports = mongoose.model('OTP', otpSchema);

