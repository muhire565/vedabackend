const User = require('../models/User');
const { validationResult } = require('express-validator');

// @route   GET /api/user/profile
// @desc    Get current user profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Format user response consistently with authController
    res.json({
      success: true,
      data: {
        user: {
          id: user._id.toString(),
          _id: user._id.toString(),
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          isEmailVerified: user.isEmailVerified,
          onboardingCompleted: user.onboardingCompleted,
          onboardingData: user.onboardingData || {},
          role: user.role,
          notificationPreferences: user.notificationPreferences || {
            workoutReminders: true,
            mealReminders: true,
            progressUpdates: true,
            weeklyReports: true,
            motivationalMessages: true,
            communityUpdates: false,
          },
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const userId = req.user.id;
    const {
      fullName,
      phone,
      onboardingData,
      notificationPreferences,
    } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update fields
    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;
    if (onboardingData) {
      user.onboardingData = {
        ...user.onboardingData,
        ...onboardingData,
      };
    }
    if (notificationPreferences) {
      user.notificationPreferences = {
        ...user.notificationPreferences,
        ...notificationPreferences,
      };
    }

    await user.save();

    // Return user without password, formatted consistently
    const userResponse = await User.findById(userId).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: userResponse._id.toString(),
          _id: userResponse._id.toString(),
          fullName: userResponse.fullName,
          email: userResponse.email,
          phone: userResponse.phone,
          isEmailVerified: userResponse.isEmailVerified,
          onboardingCompleted: userResponse.onboardingCompleted,
          onboardingData: userResponse.onboardingData || {},
          role: userResponse.role,
          notificationPreferences: userResponse.notificationPreferences || {
            workoutReminders: true,
            mealReminders: true,
            progressUpdates: true,
            weeklyReports: true,
            motivationalMessages: true,
            communityUpdates: false,
          },
          createdAt: userResponse.createdAt,
          updatedAt: userResponse.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
};

