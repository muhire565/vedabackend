const { validationResult } = require('express-validator');
const { chatWithAI } = require('../services/aiService');
const User = require('../models/User');

// @route   POST /api/ai/chat
// @desc    Send message to AI coach and get response
// @access  Private
const chat = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { message, conversationHistory = [] } = req.body;

    // Get user data for context (optional - can be used to personalize responses)
    const user = await User.findById(req.user.id).select('-password');
    
    // Add user context to the message if available
    let contextualMessage = message;
    if (user && user.onboardingData) {
      const firstName = user.fullName?.split(' ')[0] || 'User';
      const context = `STRICT INSTRUCTION — You MUST personalize this answer. Use the profile below.

User Profile:
- Name: ${firstName}
- Age: ${user.onboardingData.age || 'Not specified'} years old
- Gender: ${user.onboardingData.gender || 'Not specified'}
- Height: ${user.onboardingData.height || 'Not specified'} cm
- Weight: ${user.onboardingData.weight || 'Not specified'} kg
- Activity Level: ${user.onboardingData.activityLevel || 'Not specified'}
- Goal: ${user.onboardingData.goal || 'Not specified'}
- Medical Conditions: ${user.onboardingData.medicalConditions?.join(', ') || 'None'}
- Dietary Restrictions: ${user.onboardingData.dietaryRestrictions?.join(', ') || 'None'}

MANDATORY: Start your response with "Hello ${firstName}," then reference 1-2 profile facts before giving advice. Do NOT give generic lists or vague options. Give ONE specific recommendation tied to this profile.

User Question: ${message}`;
      contextualMessage = context;
    }

    // Get AI response
    const result = await chatWithAI(contextualMessage, conversationHistory);

    res.json({
      success: true,
      data: {
        message: result.message,
      },
    });
  } catch (error) {
    console.error('AI Chat error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get AI response',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  chat,
};

