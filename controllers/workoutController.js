const WorkoutPlan = require('../models/WorkoutPlan');
const WorkoutSession = require('../models/WorkoutSession');
const { validationResult } = require('express-validator');
const { createNotification } = require('./notificationController');

// @route   GET /api/workouts/plans
// @desc    Get all workout plans (public + user's own)
// @access  Private
const getWorkoutPlans = async (req, res) => {
  try {
    const userId = req.user.id;

    const plans = await WorkoutPlan.find({
      $or: [
        { isPublic: true },
        { userId: userId },
      ],
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        plans,
      },
    });
  } catch (error) {
    console.error('Get workout plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch workout plans',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @route   GET /api/workouts/plans/:id
// @desc    Get single workout plan
// @access  Private
const getWorkoutPlanById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const plan = await WorkoutPlan.findOne({
      _id: id,
      $or: [
        { isPublic: true },
        { userId: userId },
      ],
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Workout plan not found',
      });
    }

    res.json({
      success: true,
      data: {
        plan,
      },
    });
  } catch (error) {
    console.error('Get workout plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch workout plan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @route   GET /api/workouts/current
// @desc    Get user's current active workout plan with progress
// @access  Private
const getCurrentPlan = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get active plan
    const activePlan = await WorkoutPlan.findOne({
      userId,
      isActive: true,
    });

    if (!activePlan) {
      return res.json({
        success: true,
        data: {
          plan: null,
          progress: null,
        },
      });
    }

    // Calculate progress
    const startDate = activePlan.createdAt || new Date();
    const weeksElapsed = Math.floor((new Date() - startDate) / (7 * 24 * 60 * 60 * 1000)) + 1;
    const currentWeek = Math.min(weeksElapsed, activePlan.duration);

    // Get completed sessions
    const completedSessions = await WorkoutSession.countDocuments({
      userId,
      workoutPlanId: activePlan._id,
      status: 'completed',
    });

    // Calculate consistency (workouts completed vs expected)
    const expectedWorkouts = Math.floor((currentWeek / activePlan.duration) * activePlan.totalWorkouts);
    const consistency = expectedWorkouts > 0 
      ? Math.round((completedSessions / expectedWorkouts) * 100) 
      : 0;

    const progress = {
      currentWeek,
      totalWeeks: activePlan.duration,
      workoutsCompleted: completedSessions,
      totalWorkouts: activePlan.totalWorkouts,
      progressPercentage: Math.round((completedSessions / activePlan.totalWorkouts) * 100),
      consistency,
    };

    res.json({
      success: true,
      data: {
        plan: activePlan,
        progress,
      },
    });
  } catch (error) {
    console.error('Get current plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch current plan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @route   GET /api/workouts/today
// @desc    Get today's workout
// @access  Private
const getTodayWorkout = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    // Get today's session
    let session = await WorkoutSession.findOne({
      userId,
      date: { $gte: today, $lte: endOfToday },
    });

    if (!session) {
      // Try to get from active plan
      const activePlan = await WorkoutPlan.findOne({
        userId,
        isActive: true,
      });

      if (activePlan) {
        const dayOfWeek = today.getDay(); // 0-6 (Sunday-Saturday)
        const startDate = activePlan.createdAt || new Date();
        const weeksElapsed = Math.floor((today - startDate) / (7 * 24 * 60 * 60 * 1000));
        const currentWeek = Math.min(weeksElapsed + 1, activePlan.duration);

        // Find workout for today
        const todayWorkout = activePlan.workouts.find(
          w => w.week === currentWeek && w.day === dayOfWeek
        );

        if (todayWorkout && todayWorkout.name !== 'Rest Day') {
          // Create session from plan and save to database
          session = new WorkoutSession({
            userId,
            workoutPlanId: activePlan._id,
            workoutName: todayWorkout.name,
            date: today,
            duration: todayWorkout.duration || 0,
            calories: todayWorkout.calories || 0,
            difficulty: todayWorkout.difficulty || 'Beginner',
            exercises: todayWorkout.exercises.map(ex => ({
              name: ex.name,
              sets: ex.sets || '',
              reps: ex.reps || '',
              duration: ex.duration || '',
              completed: false,
            })),
            status: 'scheduled',
          });
          await session.save();
        }
      }
    }

    // If no session found and we have an active plan, try to schedule it
    if (!session) {
      const activePlan = await WorkoutPlan.findOne({
        userId,
        isActive: true,
      });

      if (activePlan) {
        // Try to schedule workouts for current week (in case they weren't scheduled on activation)
        await scheduleWorkoutsForCurrentWeek(userId, activePlan);
        
        // Try to get today's session again
        session = await WorkoutSession.findOne({
          userId,
          date: { $gte: today, $lte: endOfToday },
        });
      }
    }

    res.json({
      success: true,
      data: {
        workout: session,
      },
    });
  } catch (error) {
    console.error('Get today workout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch today workout',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @route   GET /api/workouts/week
// @desc    Get this week's workout schedule
// @access  Private
const getWeekSchedule = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Get active plan
    const activePlan = await WorkoutPlan.findOne({
      userId,
      isActive: true,
    });

    if (!activePlan) {
      return res.json({
        success: true,
        data: {
          schedule: [],
        },
      });
    }

    // Get completed sessions for the week
    const sessions = await WorkoutSession.find({
      userId,
      date: { $gte: startOfWeek, $lte: endOfWeek },
    });

    const startDate = activePlan.createdAt || new Date();
    const weeksElapsed = Math.floor((startOfWeek - startDate) / (7 * 24 * 60 * 60 * 1000));
    const currentWeek = Math.min(weeksElapsed + 1, activePlan.duration);

    // Build week schedule
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const schedule = [];

    for (let day = 0; day < 7; day++) {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + day);

      const workout = activePlan.workouts.find(
        w => w.week === currentWeek && w.day === day
      );

      const session = sessions.find(s => {
        const sessionDate = new Date(s.date);
        return sessionDate.getDate() === dayDate.getDate() &&
               sessionDate.getMonth() === dayDate.getMonth() &&
               sessionDate.getFullYear() === dayDate.getFullYear();
      });

      if (workout || session) {
        schedule.push({
          day: days[day],
          workout: workout ? workout.name : session?.workoutName || 'Rest Day',
          duration: workout ? `${workout.duration} min` : (session?.duration ? `${session.duration} min` : '-'),
          completed: session?.status === 'completed',
          active: dayDate.toDateString() === today.toDateString() && !session?.completed,
        });
      } else {
        schedule.push({
          day: days[day],
          workout: 'Rest Day',
          duration: '-',
          completed: false,
          active: dayDate.toDateString() === today.toDateString(),
        });
      }
    }

    res.json({
      success: true,
      data: {
        schedule,
        currentWeek,
      },
    });
  } catch (error) {
    console.error('Get week schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch week schedule',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @route   POST /api/workouts/plans/:id/activate
// @desc    Activate a workout plan for the user
// @access  Private
const activatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Deactivate all other plans
    await WorkoutPlan.updateMany(
      { userId, isActive: true },
      { isActive: false }
    );

    // Get the plan (must be public or user's own)
    const plan = await WorkoutPlan.findOne({
      _id: id,
      $or: [
        { isPublic: true },
        { userId: userId },
      ],
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Workout plan not found',
      });
    }

    // Create user copy if it's a system plan
    let userPlan = plan;
    if (!plan.userId) {
      userPlan = new WorkoutPlan({
        ...plan.toObject(),
        _id: undefined,
        userId,
        isActive: true,
        isPublic: false,
        createdAt: new Date(),
      });
      await userPlan.save();
    } else {
      plan.isActive = true;
      await plan.save();
      userPlan = plan;
    }

    // Schedule workouts for the current week
    await scheduleWorkoutsForCurrentWeek(userId, userPlan);

    // Send notification when plan is activated
    await createNotification(
      userId,
      'workout',
      'Workout Plan Activated!',
      `Your workout plan "${userPlan.name}" has been successfully activated. Get ready to achieve your fitness goals!`,
      { 
        sendEmail: true,
        scheduledTime: 'Now',
        actionUrl: '/workouts'
      }
    );

    res.json({
      success: true,
      data: {
        plan: userPlan,
      },
    });
  } catch (error) {
    console.error('Activate plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to activate plan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @route   POST /api/workouts/plans
// @desc    Create a new workout plan
// @access  Private
const createWorkoutPlan = async (req, res) => {
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
      name,
      description,
      duration,
      difficulty,
      goal,
      image,
      workouts,
    } = req.body;

    // Calculate total workouts (exclude rest days)
    const totalWorkouts = workouts 
      ? workouts.filter(w => w.name !== 'Rest Day' && w.name !== 'rest day').length 
      : 0;

    const plan = new WorkoutPlan({
      userId,
      name,
      description: description || '',
      duration: parseInt(duration) || 4,
      difficulty: difficulty || 'Beginner',
      goal: goal || 'overall-fitness',
      image: image || '',
      totalWorkouts,
      isActive: false,
      isPublic: false, // User-created plans are private by default
      workouts: workouts || [],
    });

    await plan.save();

    res.status(201).json({
      success: true,
      data: {
        plan,
      },
    });
  } catch (error) {
    console.error('Create workout plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create workout plan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @route   POST /api/workouts/sessions
// @desc    Create or update a workout session
// @access  Private
const createWorkoutSession = async (req, res) => {
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
      workoutPlanId,
      workoutName,
      date,
      duration,
      calories,
      difficulty,
      exercises,
      status,
    } = req.body;

    const sessionDate = date ? new Date(date) : new Date();
    sessionDate.setHours(0, 0, 0, 0);
    const endOfDay = new Date(sessionDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Check if session already exists
    let session = await WorkoutSession.findOne({
      userId,
      date: { $gte: sessionDate, $lte: endOfDay },
    });

    if (session) {
      // Update existing session
      session.workoutPlanId = workoutPlanId || session.workoutPlanId;
      session.workoutName = workoutName || session.workoutName;
      session.duration = duration !== undefined ? duration : session.duration;
      session.calories = calories !== undefined ? calories : session.calories;
      session.difficulty = difficulty || session.difficulty;
      session.exercises = exercises || session.exercises;
      session.status = status || session.status;

      if (status === 'completed') {
        session.completedAt = new Date();
      }
      if (status === 'in-progress' && !session.startedAt) {
        session.startedAt = new Date();
      }

      await session.save();
    } else {
      // Create new session
      session = new WorkoutSession({
        userId,
        workoutPlanId,
        workoutName,
        date: sessionDate,
        duration: duration || 0,
        calories: calories || 0,
        difficulty: difficulty || 'Beginner',
        exercises: exercises || [],
        status: status || 'scheduled',
        startedAt: status === 'in-progress' ? new Date() : null,
        completedAt: status === 'completed' ? new Date() : null,
      });

      await session.save();
    }

    res.json({
      success: true,
      data: {
        session,
      },
    });
  } catch (error) {
    console.error('Create workout session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create workout session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Helper function to schedule workouts for the current week
const scheduleWorkoutsForCurrentWeek = async (userId, activePlan) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = activePlan.createdAt || today;
    const weeksElapsed = Math.floor((today - startDate) / (7 * 24 * 60 * 60 * 1000));
    const currentWeek = Math.min(weeksElapsed + 1, activePlan.duration);

    // Get start of current week (Sunday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Get existing sessions for this week
    const existingSessions = await WorkoutSession.find({
      userId,
      date: { $gte: startOfWeek, $lte: endOfWeek },
    });

    // Create a map of existing sessions by date
    const existingSessionsMap = new Map();
    existingSessions.forEach(session => {
      const sessionDate = new Date(session.date);
      const dateKey = `${sessionDate.getFullYear()}-${sessionDate.getMonth()}-${sessionDate.getDate()}`;
      existingSessionsMap.set(dateKey, session);
    });

    // Schedule workouts for each day of the week
    for (let day = 0; day < 7; day++) {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + day);
      dayDate.setHours(0, 0, 0, 0);

      // Check if session already exists for this day
      const dateKey = `${dayDate.getFullYear()}-${dayDate.getMonth()}-${dayDate.getDate()}`;
      if (existingSessionsMap.has(dateKey)) {
        continue; // Skip if session already exists
      }

      // Find workout for this day and week
      const workout = activePlan.workouts.find(
        w => w.week === currentWeek && w.day === day
      );

      if (workout && workout.name !== 'Rest Day' && workout.name !== 'rest day') {
        // Create session for this day
        const session = new WorkoutSession({
          userId,
          workoutPlanId: activePlan._id,
          workoutName: workout.name,
          date: dayDate,
          duration: workout.duration || 0,
          calories: workout.calories || 0,
          difficulty: workout.difficulty || 'Beginner',
          exercises: (workout.exercises || []).map(ex => ({
            name: ex.name,
            sets: ex.sets || '',
            reps: ex.reps || '',
            duration: ex.duration || '',
            completed: false,
          })),
          status: 'scheduled',
        });

        await session.save();

        // Send notification for scheduled workout (only for today's workout)
        const todayCheck = new Date();
        todayCheck.setHours(0, 0, 0, 0);
        if (dayDate.getTime() === todayCheck.getTime()) {
          try {
            await createNotification(
              userId,
              'workout',
              `Workout Scheduled: ${workout.name}`,
              `Your workout "${workout.name}" is scheduled for today. Time to get moving!`,
              { 
                sendEmail: true,
                scheduledTime: 'Today',
                actionUrl: '/workouts/today'
              }
            );
          } catch (notifError) {
            // Don't fail scheduling if notification fails
            console.error('Error sending workout scheduled notification:', notifError);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error scheduling workouts for current week:', error);
    // Don't throw - this is a helper function, we don't want to break plan activation
  }
};

// @route   PUT /api/workouts/sessions/:id
// @desc    Update a workout session
// @access  Private
const updateWorkoutSession = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    const session = await WorkoutSession.findOne({ _id: id, userId });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Workout session not found',
      });
    }

    // Update fields
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        session[key] = updates[key];
      }
    });

    await session.save();

    res.json({
      success: true,
      data: {
        session,
      },
    });
  } catch (error) {
    console.error('Update workout session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update workout session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @route   POST /api/workouts/sessions/:id/start
// @desc    Start a workout session
// @access  Private
const startWorkout = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const session = await WorkoutSession.findOne({ _id: id, userId });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Workout session not found',
      });
    }

    session.status = 'in-progress';
    session.startedAt = new Date();
    await session.save();

    // Send notification
    try {
      await createNotification(
        userId,
        'workout',
        'Workout Started!',
        `You've started "${session.workoutName}". Keep up the great work!`,
        { 
          sendEmail: false, // Don't send email for workout start
          scheduledTime: 'Now',
          actionUrl: '/workouts'
        }
      );
    } catch (notifError) {
      console.error('Error sending workout start notification:', notifError);
    }

    res.json({
      success: true,
      data: {
        session,
      },
    });
  } catch (error) {
    console.error('Start workout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start workout',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @route   POST /api/workouts/sessions/:id/complete
// @desc    Complete a workout session
// @access  Private
const completeWorkout = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { duration, caloriesBurned } = req.body;

    const session = await WorkoutSession.findOne({ _id: id, userId });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Workout session not found',
      });
    }

    session.status = 'completed';
    session.completedAt = new Date();
    if (duration) session.duration = duration;
    if (caloriesBurned) session.calories = caloriesBurned;
    
    // Mark all exercises as completed
    session.exercises.forEach(exercise => {
      exercise.completed = true;
    });

    await session.save();

    // Send celebration notification with email
    try {
      await createNotification(
        userId,
        'workout',
        '🎉 Workout Completed!',
        `Congratulations! You've completed "${session.workoutName}" and burned ${session.calories} calories. Keep crushing your fitness goals!`,
        { 
          sendEmail: true,
          scheduledTime: 'Now',
          actionUrl: '/analytics'
        }
      );
    } catch (notifError) {
      console.error('Error sending workout completion notification:', notifError);
    }

    res.json({
      success: true,
      data: {
        session,
      },
    });
  } catch (error) {
    console.error('Complete workout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete workout',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @route   POST /api/workouts/sessions/:id/skip
// @desc    Skip a workout session
// @access  Private
const skipWorkout = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const session = await WorkoutSession.findOne({ _id: id, userId });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Workout session not found',
      });
    }

    session.status = 'skipped';
    await session.save();

    res.json({
      success: true,
      data: {
        session,
      },
    });
  } catch (error) {
    console.error('Skip workout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to skip workout',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  getWorkoutPlans,
  getWorkoutPlanById,
  getCurrentPlan,
  getTodayWorkout,
  getWeekSchedule,
  activatePlan,
  createWorkoutPlan,
  createWorkoutSession,
  updateWorkoutSession,
  startWorkout,
  completeWorkout,
  skipWorkout,
};

