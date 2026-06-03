const Device = require('../models/Device');
const HealthTracker = require('../models/HealthTracker');
const WorkoutSession = require('../models/WorkoutSession');

// @route   GET /api/devices
// @desc    Get all devices for the logged-in user
// @access  Private
const getDevices = async (req, res) => {
  try {
    const userId = req.user.id;
    const devices = await Device.find({ userId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { devices },
    });
  } catch (error) {
    console.error('Get devices error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch devices',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @route   POST /api/devices
// @desc    Connect a new device
// @access  Private
const connectDevice = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, type, deviceId, accessToken, refreshToken, syncSettings } = req.body;

    if (!name || !type || !deviceId || !accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, type, deviceId, accessToken',
      });
    }

    // Check if device already exists
    let device = await Device.findOne({ userId, deviceId });

    if (device) {
      // Update existing device
      device.name = name;
      device.type = type;
      device.accessToken = accessToken;
      device.refreshToken = refreshToken || device.refreshToken;
      device.isConnected = true;
      device.syncSettings = { ...device.syncSettings, ...syncSettings };
      await device.save();
    } else {
      // Create new device
      device = new Device({
        userId,
        name,
        type,
        deviceId,
        accessToken,
        refreshToken: refreshToken || '',
        syncSettings: syncSettings || {
          steps: true,
          heartRate: true,
          sleep: true,
          workouts: true,
          weight: true,
        },
      });
      await device.save();
    }

    res.json({
      success: true,
      data: { device },
      message: 'Device connected successfully',
    });
  } catch (error) {
    console.error('Connect device error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to connect device',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @route   PUT /api/devices/:id
// @desc    Update device settings
// @access  Private
const updateDevice = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, syncSettings, isConnected } = req.body;

    const device = await Device.findOne({ _id: id, userId });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found',
      });
    }

    if (name) device.name = name;
    if (syncSettings) device.syncSettings = { ...device.syncSettings, ...syncSettings };
    if (typeof isConnected === 'boolean') device.isConnected = isConnected;

    await device.save();

    res.json({
      success: true,
      data: { device },
      message: 'Device updated successfully',
    });
  } catch (error) {
    console.error('Update device error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update device',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @route   DELETE /api/devices/:id
// @desc    Disconnect/delete a device
// @access  Private
const disconnectDevice = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const device = await Device.findOne({ _id: id, userId });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found',
      });
    }

    await Device.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Device disconnected successfully',
    });
  } catch (error) {
    console.error('Disconnect device error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disconnect device',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @route   POST /api/devices/:id/sync
// @desc    Sync data from device
// @access  Private
const syncDevice = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { data } = req.body; // Data from device: { steps, heartRate, sleep, workouts, weight }

    const device = await Device.findOne({ _id: id, userId, isConnected: true });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found or not connected',
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    // Get or create today's health tracker
    let healthTracker = await HealthTracker.findOne({
      userId,
      date: { $gte: today, $lte: endOfToday },
    });

    if (!healthTracker) {
      healthTracker = new HealthTracker({
        userId,
        date: today,
      });
    }

    // Sync data based on settings
    const syncedData = {};

    if (device.syncSettings.steps && data.steps !== undefined) {
      healthTracker.steps = Math.max(healthTracker.steps || 0, data.steps);
      syncedData.steps = data.steps;
    }

    if (device.syncSettings.sleep && data.sleep !== undefined) {
      healthTracker.sleep = data.sleep;
      syncedData.sleep = data.sleep;
    }

    if (device.syncSettings.weight && data.weight !== undefined) {
      healthTracker.weight = data.weight;
      syncedData.weight = data.weight;
    }

    await healthTracker.save();

    // Update device last synced time
    device.lastSynced = new Date();
    await device.save();

    res.json({
      success: true,
      data: {
        syncedData,
        lastSynced: device.lastSynced,
      },
      message: 'Device synced successfully',
    });
  } catch (error) {
    console.error('Sync device error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync device',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  getDevices,
  connectDevice,
  updateDevice,
  disconnectDevice,
  syncDevice,
};

