const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { sendOTP, verifyEmailOTP, resendOTPCode } = require('../controllers/otpController');

// Validation rules
const emailValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
];

const verifyValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Verification code is required')
    .isLength({ min: 6, max: 6 })
    .withMessage('Verification code must be 6 digits')
    .isNumeric()
    .withMessage('Verification code must be numeric'),
];

// Routes
router.post('/send', emailValidation, sendOTP);
router.post('/verify', verifyValidation, verifyEmailOTP);
router.post('/resend', emailValidation, resendOTPCode);

module.exports = router;

