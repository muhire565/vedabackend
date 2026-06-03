const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const {
  getWorkoutPlans,
  getWorkoutPlanById,
  getCurrentPlan,
  getTodayWorkout,
  getWeekSchedule,
  activatePlan,
  createWorkoutSession,
  createWorkoutPlan,
  updateWorkoutSession,
  startWorkout,
  completeWorkout,
  skipWorkout,
} = require('../controllers/workoutController');

// @route   GET /api/workouts/plans
// @desc    Get all workout plans
// @access  Private
router.get('/plans', authenticateToken, getWorkoutPlans);

// @route   GET /api/workouts/plans/:id
// @desc    Get single workout plan
// @access  Private
router.get('/plans/:id', authenticateToken, getWorkoutPlanById);

// @route   GET /api/workouts/current
// @desc    Get user's current active plan
// @access  Private
router.get('/current', authenticateToken, getCurrentPlan);

// @route   GET /api/workouts/today
// @desc    Get today's workout
// @access  Private
router.get('/today', authenticateToken, getTodayWorkout);

// @route   GET /api/workouts/week
// @desc    Get this week's schedule
// @access  Private
router.get('/week', authenticateToken, getWeekSchedule);

// @route   POST /api/workouts/plans
// @desc    Create a new workout plan
// @access  Private
router.post('/plans', authenticateToken, createWorkoutPlan);

// @route   POST /api/workouts/plans/:id/activate
// @desc    Activate a workout plan
// @access  Private
router.post('/plans/:id/activate', authenticateToken, activatePlan);

// @route   POST /api/workouts/sessions
// @desc    Create or update workout session
// @access  Private
router.post('/sessions', authenticateToken, createWorkoutSession);

// @route   PUT /api/workouts/sessions/:id
// @desc    Update workout session
// @access  Private
router.put('/sessions/:id', authenticateToken, updateWorkoutSession);

// @route   POST /api/workouts/sessions/:id/start
// @desc    Start workout session
// @access  Private
router.post('/sessions/:id/start', authenticateToken, startWorkout);

// @route   POST /api/workouts/sessions/:id/complete
// @desc    Complete workout session
// @access  Private
router.post('/sessions/:id/complete', authenticateToken, completeWorkout);

// @route   POST /api/workouts/sessions/:id/skip
// @desc    Skip workout session
// @access  Private
router.post('/sessions/:id/skip', authenticateToken, skipWorkout);

module.exports = router;

