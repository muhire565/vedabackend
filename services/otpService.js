const OTP = require('../models/OTP');
const crypto = require('crypto');

// Generate 6-digit OTP code
const generateOTP = () => {
  // Generate a random 6-digit number
  return crypto.randomInt(100000, 999999).toString();
};

// Create and save OTP
const createOTP = async (email, purpose = 'email_verification') => {
  try {
    // Delete any existing unverified OTPs for this email
    await OTP.deleteMany({ email: email.toLowerCase(), purpose, verified: false });

    // Generate new OTP
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Create and save OTP
    const otp = new OTP({
      email: email.toLowerCase(),
      code,
      purpose,
      expiresAt,
      verified: false,
    });

    await otp.save();
    return code;
  } catch (error) {
    console.error('Error creating OTP:', error);
    throw new Error('Failed to generate verification code');
  }
};

// Verify OTP
const verifyOTP = async (email, code, purpose = 'email_verification') => {
  try {
    // Find the OTP for this email
    const otp = await OTP.findOne({
      email: email.toLowerCase(),
      code,
      purpose,
      verified: false,
    });

    if (!otp) {
      return { valid: false, message: 'Invalid verification code' };
    }

    // Check if expired
    if (new Date() > otp.expiresAt) {
      await OTP.deleteOne({ _id: otp._id });
      return { valid: false, message: 'Verification code has expired' };
    }

    // Mark as verified
    otp.verified = true;
    await otp.save();

    // Delete all OTPs for this email (cleanup)
    await OTP.deleteMany({ email: email.toLowerCase(), purpose });

    return { valid: true, message: 'Email verified successfully' };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw new Error('Failed to verify code');
  }
};

// Resend OTP
const resendOTP = async (email, purpose = 'email_verification') => {
  try {
    // Delete existing unverified OTPs
    await OTP.deleteMany({ email: email.toLowerCase(), purpose, verified: false });
    
    // Generate new OTP
    const code = await createOTP(email, purpose);
    return code;
  } catch (error) {
    console.error('Error resending OTP:', error);
    throw new Error('Failed to resend verification code');
  }
};

module.exports = {
  generateOTP,
  createOTP,
  verifyOTP,
  resendOTP,
};

