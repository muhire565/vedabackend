const User = require('../models/User');
const { validationResult } = require('express-validator');

// @route   PUT /api/onboarding
// @desc    Save or update user onboarding data
// @access  Private
const saveOnboardingData = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg,
      }));
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errorMessages,
      });
    }

    const {
      age,
      gender,
      height,
      weight,
      activityLevel,
      goal,
      medicalConditions,
      dietaryRestrictions,
      sleepHours,
      stressLevel,
      waterIntake,
      notes,
    } = req.body;

    // Find user and update onboarding data
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update onboarding data
    user.onboardingData = {
      age: age ? parseInt(age) : undefined,
      gender: gender || undefined,
      height: height ? parseFloat(height) : undefined,
      weight: weight ? parseFloat(weight) : undefined,
      activityLevel: activityLevel || undefined,
      goal: goal || undefined,
      medicalConditions: Array.isArray(medicalConditions) ? medicalConditions : [],
      dietaryRestrictions: Array.isArray(dietaryRestrictions) ? dietaryRestrictions : [],
      sleepHours: sleepHours ? parseFloat(sleepHours) : undefined,
      stressLevel: stressLevel || undefined,
      waterIntake: waterIntake ? parseFloat(waterIntake) : undefined,
      notes: notes || undefined,
    };

    // Mark onboarding as completed
    user.onboardingCompleted = true;

    await user.save();

    // Return updated user data (excluding password)
    res.json({
      success: true,
      message: 'Onboarding data saved successfully',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          onboardingCompleted: user.onboardingCompleted,
          onboardingData: user.onboardingData,
        },
      },
    });
  } catch (error) {
    console.error('Save onboarding error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while saving onboarding data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @route   GET /api/onboarding
// @desc    Get user onboarding data
// @access  Private
const getOnboardingData = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: {
        onboardingCompleted: user.onboardingCompleted,
        onboardingData: user.onboardingData || {},
      },
    });
  } catch (error) {
    console.error('Get onboarding error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching onboarding data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  saveOnboardingData,
  getOnboardingData,
};

