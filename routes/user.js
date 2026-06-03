const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticateToken } = require('../middleware/authMiddleware');
const { getProfile, updateProfile } = require('../controllers/userController');

// Validation rules
const updateProfileValidation = [
  body('fullName').optional().trim().notEmpty().withMessage('Full name cannot be empty'),
  body('phone').optional().trim().notEmpty().withMessage('Phone number cannot be empty'),
  body('onboardingData.age').optional().isInt({ min: 1, max: 150 }).withMessage('Age must be between 1 and 150'),
  body('onboardingData.gender').optional().isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
  body('onboardingData.height').optional().isFloat({ min: 50, max: 300 }).withMessage('Height must be between 50 and 300 cm'),
  body('onboardingData.weight').optional().isFloat({ min: 10, max: 500 }).withMessage('Weight must be between 10 and 500 kg'),
  body('onboardingData.activityLevel').optional().isIn(['sedentary', 'light', 'moderate', 'active', 'very-active']).withMessage('Invalid activity level'),
  body('onboardingData.goal').optional().isIn(['lose-weight', 'gain-weight', 'build-muscle', 'maintain-weight', 'improve-health']).withMessage('Invalid goal'),
];

// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authenticateToken, getProfile);

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticateToken, updateProfileValidation, updateProfile);

module.exports = router;

