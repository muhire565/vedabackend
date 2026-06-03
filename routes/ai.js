const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { chat } = require('../controllers/aiController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Validation rules
const chatValidation = [
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be between 1 and 2000 characters'),
  body('conversationHistory')
    .optional()
    .isArray()
    .withMessage('Conversation history must be an array'),
];

// Routes
router.post('/chat', authenticateToken, chatValidation, chat);

module.exports = router;

