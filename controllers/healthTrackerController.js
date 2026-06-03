const HealthTracker = require('../models/HealthTracker');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @route   GET /api/health-tracker
// @desc    Get health tracker data for a specific date
// @access  Private
const getHealthTracker = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date } = req.query;

    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    let tracker = await HealthTracker.findOne({
      userId,
      date: { $gte: targetDate, $lte: endOfDay },
    });

    // If no tracker exists, create one with default values from user onboarding
    if (!tracker) {
      const user = await User.findById(userId).select('onboardingData');
      const waterGoal = user?.onboardingData?.waterIntake || 8;
      const sleepGoal = user?.onboardingData?.sleepHours || 8;

      tracker = new HealthTracker({
        userId,
        date: targetDate,
        stepsGoal: 10000,
        waterGoal,
        sleepGoal,
        activeMinutesGoal: 60,
      });
      await tracker.save();
    }

    res.json({
      success: true,
      data: {
        tracker,
      },
    });
  } catch (error) {
    console.error('Get health tracker error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch health tracker data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @route   PUT /api/health-tracker
// @desc    Update health tracker data for today
// @access  Private
const updateHealthTracker = async (req, res) => {
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
      steps,
      water,
      sleep,
      weight,
      activeMinutes,
      caloriesBurned,
      notes,
    } = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    let tracker = await HealthTracker.findOne({
      userId,
      date: { $gte: today, $lte: endOfDay },
    });

    // Get user for default goals
    const user = await User.findById(userId).select('onboardingData');
    const waterGoal = user?.onboardingData?.waterIntake || 8;
    const sleepGoal = user?.onboardingData?.sleepHours || 8;

    if (tracker) {
      // Update existing tracker
      if (steps !== undefined) tracker.steps = steps;
      if (water !== undefined) tracker.water = water;
      if (sleep !== undefined) tracker.sleep = sleep;
      if (weight !== undefined) tracker.weight = weight;
      if (activeMinutes !== undefined) tracker.activeMinutes = activeMinutes;
      if (caloriesBurned !== undefined) tracker.caloriesBurned = caloriesBurned;
      if (notes !== undefined) tracker.notes = notes;

      await tracker.save();
    } else {
      // Create new tracker
      tracker = new HealthTracker({
        userId,
        date: today,
        steps: steps || 0,
        stepsGoal: 10000,
        water: water || 0,
        waterGoal,
        sleep: sleep || 0,
        sleepGoal,
        weight: weight || null,
        activeMinutes: activeMinutes || 0,
        activeMinutesGoal: 60,
        caloriesBurned: caloriesBurned || 0,
        notes: notes || '',
      });

      await tracker.save();
    }

    res.json({
      success: true,
      data: {
        tracker,
      },
    });
  } catch (error) {
    console.error('Update health tracker error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update health tracker data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @route   POST /api/health-tracker/add-steps
// @desc    Add steps to today's tracker
// @access  Private
const addSteps = async (req, res) => {
  try {
    const userId = req.user.id;
    const { steps } = req.body;

    if (!steps || steps < 0) {
      return res.status(400).json({
        success: false,
        message: 'Steps must be a positive number',
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    let tracker = await HealthTracker.findOne({
      userId,
      date: { $gte: today, $lte: endOfDay },
    });

    const user = await User.findById(userId).select('onboardingData');
    const waterGoal = user?.onboardingData?.waterIntake || 8;
    const sleepGoal = user?.onboardingData?.sleepHours || 8;

    if (tracker) {
      tracker.steps = (tracker.steps || 0) + steps;
      await tracker.save();
    } else {
      tracker = new HealthTracker({
        userId,
        date: today,
        steps,
        stepsGoal: 10000,
        waterGoal,
        sleepGoal,
        activeMinutesGoal: 60,
      });
      await tracker.save();
    }

    res.json({
      success: true,
      data: {
        tracker,
      },
    });
  } catch (error) {
    console.error('Add steps error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add steps',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @route   POST /api/health-tracker/add-water
// @desc    Add water (glasses) to today's tracker
// @access  Private
const addWater = async (req, res) => {
  try {
    const userId = req.user.id;
    const { glasses } = req.body;

    if (!glasses || glasses < 0) {
      return res.status(400).json({
        success: false,
        message: 'Glasses must be a positive number',
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    let tracker = await HealthTracker.findOne({
      userId,
      date: { $gte: today, $lte: endOfDay },
    });

    const user = await User.findById(userId).select('onboardingData');
    const waterGoal = user?.onboardingData?.waterIntake || 8;
    const sleepGoal = user?.onboardingData?.sleepHours || 8;

    if (tracker) {
      tracker.water = (tracker.water || 0) + glasses;
      await tracker.save();
    } else {
      tracker = new HealthTracker({
        userId,
        date: today,
        stepsGoal: 10000,
        water: glasses,
        waterGoal,
        sleepGoal,
        activeMinutesGoal: 60,
      });
      await tracker.save();
    }

    res.json({
      success: true,
      data: {
        tracker,
      },
    });
  } catch (error) {
    console.error('Add water error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add water',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @route   POST /api/health-tracker/add-sleep
// @desc    Add/update sleep hours for today's tracker
// @access  Private
const addSleep = async (req, res) => {
  try {
    const userId = req.user.id;
    const { hours } = req.body;

    if (hours === undefined || hours < 0 || hours > 24) {
      return res.status(400).json({
        success: false,
        message: 'Sleep hours must be between 0 and 24',
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    let tracker = await HealthTracker.findOne({
      userId,
      date: { $gte: today, $lte: endOfDay },
    });

    const user = await User.findById(userId).select('onboardingData');
    const waterGoal = user?.onboardingData?.waterIntake || 8;
    const sleepGoal = user?.onboardingData?.sleepHours || 8;

    if (tracker) {
      tracker.sleep = hours;
      await tracker.save();
    } else {
      tracker = new HealthTracker({
        userId,
        date: today,
        stepsGoal: 10000,
        waterGoal,
        sleep: hours,
        sleepGoal,
        activeMinutesGoal: 60,
      });
      await tracker.save();
    }

    res.json({
      success: true,
      data: {
        tracker,
      },
    });
  } catch (error) {
    console.error('Add sleep error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add sleep',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @route   POST /api/health-tracker/set-weight
// @desc    Set weight for today's tracker
// @access  Private
const setWeight = async (req, res) => {
  try {
    const userId = req.user.id;
    const { weight } = req.body;

    if (!weight || weight <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Weight must be a positive number',
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    let tracker = await HealthTracker.findOne({
      userId,
      date: { $gte: today, $lte: endOfDay },
    });

    const user = await User.findById(userId).select('onboardingData');
    const waterGoal = user?.onboardingData?.waterIntake || 8;
    const sleepGoal = user?.onboardingData?.sleepHours || 8;

    if (tracker) {
      tracker.weight = weight;
      await tracker.save();
    } else {
      tracker = new HealthTracker({
        userId,
        date: today,
        stepsGoal: 10000,
        waterGoal,
        sleepGoal,
        activeMinutesGoal: 60,
        weight,
      });
      await tracker.save();
    }

    res.json({
      success: true,
      data: {
        tracker,
      },
    });
  } catch (error) {
    console.error('Set weight error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set weight',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  getHealthTracker,
  updateHealthTracker,
  addSteps,
  addWater,
  addSleep,
  setWeight,
};

