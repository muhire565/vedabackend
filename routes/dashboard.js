const express = require('express');
const router = express.Router();
const { getDashboard } = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/authMiddleware');

// @route   GET /api/dashboard
// @desc    Get dashboard summary
// @access  Private
router.get('/', authenticateToken, getDashboard);

module.exports = router;
