const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { getAnalytics } = require('../controllers/analyticsController');

// @route   GET /api/analytics
// @desc    Get analytics data
// @access  Private
router.get('/', authenticateToken, getAnalytics);

module.exports = router;

