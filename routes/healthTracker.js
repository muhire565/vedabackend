const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const healthTrackerController = require('../controllers/healthTrackerController');

// @route   GET /api/health-tracker
// @desc    Get health tracker data
// @access  Private
router.get('/', authenticateToken, healthTrackerController.getHealthTracker);

// @route   PUT /api/health-tracker
// @desc    Update health tracker data
// @access  Private
router.put('/', authenticateToken, healthTrackerController.updateHealthTracker);

// @route   POST /api/health-tracker/add-steps
// @desc    Add steps
// @access  Private
router.post('/add-steps', authenticateToken, healthTrackerController.addSteps);

// @route   POST /api/health-tracker/add-water
// @desc    Add water
// @access  Private
router.post('/add-water', authenticateToken, healthTrackerController.addWater);

// @route   POST /api/health-tracker/add-sleep
// @desc    Add/update sleep hours
// @access  Private
router.post('/add-sleep', authenticateToken, healthTrackerController.addSleep);

// @route   POST /api/health-tracker/set-weight
// @desc    Set weight
// @access  Private
router.post('/set-weight', authenticateToken, healthTrackerController.setWeight);

module.exports = router;

