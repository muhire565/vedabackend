const { validationResult } = require('express-validator');
const { createOTP, verifyOTP, resendOTP } = require('../services/otpService');
const { sendOTPEmail } = require('../services/emailService');
const User = require('../models/User');

// @route   POST /api/auth/verify-email/send
// @desc    Send OTP to user's email
// @access  Public
const sendOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email address',
      });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified',
      });
    }

    // Create OTP
    const otpCode = await createOTP(email);

    // Send OTP via email
    await sendOTPEmail(email, otpCode);

    res.json({
      success: true,
      message: 'Verification code sent to your email',
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send verification code',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @route   POST /api/auth/verify-email/verify
// @desc    Verify OTP code
// @access  Public
const verifyEmailOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { email, code } = req.body;

    // Verify OTP
    const result = await verifyOTP(email, code);

    if (!result.valid) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    // Update user's email verification status
    const user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      user.isEmailVerified = true;
      await user.save();
    }

    res.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify code',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @route   POST /api/auth/verify-email/resend
// @desc    Resend OTP code
// @access  Public
const resendOTPCode = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email address',
      });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified',
      });
    }

    // Resend OTP
    const otpCode = await resendOTP(email);

    // Send OTP via email
    await sendOTPEmail(email, otpCode);

    res.json({
      success: true,
      message: 'Verification code resent to your email',
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to resend verification code',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  sendOTP,
  verifyEmailOTP,
  resendOTPCode,
};

