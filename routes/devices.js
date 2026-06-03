const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const {
  getDevices,
  connectDevice,
  updateDevice,
  disconnectDevice,
  syncDevice,
} = require('../controllers/deviceController');

// @route   GET /api/devices
// @desc    Get all devices
// @access  Private
router.get('/', authenticateToken, getDevices);

// @route   POST /api/devices
// @desc    Connect a new device
// @access  Private
router.post('/', authenticateToken, connectDevice);

// @route   PUT /api/devices/:id
// @desc    Update device settings
// @access  Private
router.put('/:id', authenticateToken, updateDevice);

// @route   DELETE /api/devices/:id
// @desc    Disconnect/delete a device
// @access  Private
router.delete('/:id', authenticateToken, disconnectDevice);

// @route   POST /api/devices/:id/sync
// @desc    Sync data from device
// @access  Private
router.post('/:id/sync', authenticateToken, syncDevice);

module.exports = router;

