const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { saveOnboardingData, getOnboardingData } = require('../controllers/onboardingController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Validation rules for onboarding data
const onboardingValidation = [
  body('age')
    .optional({ checkFalsy: true })
    .isInt({ min: 1, max: 150 })
    .withMessage('Age must be between 1 and 150'),
  body('gender')
    .optional({ checkFalsy: true })
    .isIn(['male', 'female', 'other', 'prefer-not-to-say'])
    .withMessage('Invalid gender value'),
  body('height')
    .optional({ checkFalsy: true })
    .isFloat({ min: 30, max: 300 })
    .withMessage('Height must be between 30 and 300 cm'),
  body('weight')
    .optional({ checkFalsy: true })
    .isFloat({ min: 10, max: 500 })
    .withMessage('Weight must be between 10 and 500 kg'),
  body('activityLevel')
    .optional({ checkFalsy: true })
    .isIn(['sedentary', 'light', 'moderate', 'active', 'very-active'])
    .withMessage('Invalid activity level'),
  body('goal')
    .optional({ checkFalsy: true })
    .isIn(['lose-weight', 'maintain-weight', 'gain-weight', 'build-muscle', 'improve-health'])
    .withMessage('Invalid goal value'),
  body('medicalConditions')
    .optional({ checkFalsy: true })
    .isArray()
    .withMessage('Medical conditions must be an array'),
  body('dietaryRestrictions')
    .optional({ checkFalsy: true })
    .isArray()
    .withMessage('Dietary restrictions must be an array'),
  body('sleepHours')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0, max: 24 })
    .withMessage('Sleep hours must be between 0 and 24'),
  body('stressLevel')
    .optional({ checkFalsy: true })
    .isIn(['low', 'moderate', 'high', 'very-high'])
    .withMessage('Invalid stress level'),
  body('waterIntake')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0, max: 20 })
    .withMessage('Water intake must be between 0 and 20 liters'),
  body('notes')
    .optional({ checkFalsy: true })
    .isString()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters'),
];

// Routes
router.get('/', authenticateToken, getOnboardingData);
router.put('/', authenticateToken, onboardingValidation, saveOnboardingData);

module.exports = router;

