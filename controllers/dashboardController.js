const Meal = require('../models/Meal');
const User = require('../models/User');
const HealthTracker = require('../models/HealthTracker');
const WorkoutSession = require('../models/WorkoutSession');

// @route   GET /api/dashboard
// @desc    Get dashboard summary data for logged-in user
// @access  Private
const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user data with onboarding info
    const user = await User.findById(userId).select('fullName onboardingData');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    // Get today's meals
    const todayMeals = await Meal.find({
      userId,
      date: { $gte: today, $lte: endOfToday },
    }).sort({ time: 1 });

    // Calculate today's nutrition totals
    const todayTotals = todayMeals.reduce(
      (acc, meal) => {
        acc.calories += meal.calories || 0;
        acc.protein += meal.protein || 0;
        acc.carbs += meal.carbs || 0;
        acc.fats += meal.fats || 0;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

    // Calculate nutrition goals from user data
    const calculateNutritionGoals = (onboardingData) => {
      if (!onboardingData || !onboardingData.weight || !onboardingData.height || !onboardingData.age) {
        return {
          calories: 2200,
          protein: 120,
          carbs: 220,
          fats: 70,
        };
      }

      const { age, gender, height, weight, activityLevel, goal } = onboardingData;

      // BMR calculation (Mifflin-St Jeor Equation)
      let bmr = 0;
      if (gender === 'male') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
      } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
      }

      // Activity multipliers
      const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        'very-active': 1.9,
      };

      const multiplier = activityMultipliers[activityLevel || 'moderate'] || 1.55;
      let calories = Math.round(bmr * multiplier);

      // Adjust based on goal
      if (goal === 'lose-weight') {
        calories = Math.round(calories * 0.85); // 15% deficit
      } else if (goal === 'gain-weight') {
        calories = Math.round(calories * 1.15); // 15% surplus
      } else if (goal === 'build-muscle') {
        calories = Math.round(calories * 1.1); // 10% surplus
      }

      return {
        calories,
        protein: Math.round(calories * 0.25 / 4), // 25% of calories from protein
        carbs: Math.round(calories * 0.45 / 4), // 45% of calories from carbs
        fats: Math.round(calories * 0.30 / 9), // 30% of calories from fats
      };
    };

    const nutritionGoals = calculateNutritionGoals(user.onboardingData);

    // Get last 7 days for weekly stats
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get meals from last 7 days
    const weeklyMeals = await Meal.find({
      userId,
      date: { $gte: sevenDaysAgo, $lte: endOfToday },
    });

    // Calculate weekly average calories (use the same sevenDaysAgo calculated earlier)
    const weeklyCalories = weeklyMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
    const avgDailyCalories = weeklyMeals.length > 0 
      ? Math.round(weeklyCalories / 7) 
      : 0;

    // Get water and sleep goals from onboarding data
    const waterGoal = user.onboardingData?.waterIntake || 8; // glasses
    const sleepGoal = user.onboardingData?.sleepHours || 8; // hours
    const stepsGoal = 10000;

    // Get health tracker data for today
    const healthTracker = await HealthTracker.findOne({
      userId,
      date: { $gte: today, $lte: endOfToday },
    });

    const steps = healthTracker?.steps || 0;
    const water = healthTracker?.water || 0;
    const sleep = healthTracker?.sleep || 0;

    // Format today's meals for display
    const formattedMeals = todayMeals.slice(0, 3).map((meal) => ({
      id: meal._id.toString(),
      name: meal.type.charAt(0).toUpperCase() + meal.type.slice(1).replace(/-/g, ' '),
      time: meal.time || 'N/A',
      items: meal.description || meal.name,
      calories: meal.calories || 0,
      completed: meal.logged || false,
    }));

    // Calculate weekly workouts completed (reuse sevenDaysAgo from weekly meals calculation above)
    const weeklyWorkoutsCompleted = await WorkoutSession.countDocuments({
      userId,
      date: { $gte: sevenDaysAgo, $lte: endOfToday },
      status: 'completed',
    });
    const weeklyWorkoutsGoal = 5; // Default goal

    res.json({
      success: true,
      data: {
        user: {
          fullName: user.fullName,
        },
        dailyStats: {
          steps: steps,
          stepsGoal: stepsGoal,
          calories: todayTotals.calories,
          caloriesGoal: nutritionGoals.calories,
          water: water,
          waterGoal: waterGoal,
          sleep: sleep,
          sleepGoal: sleepGoal,
        },
        todayMeals: formattedMeals,
        weeklyProgress: {
          workoutsCompleted: weeklyWorkoutsCompleted,
          workoutsGoal: weeklyWorkoutsGoal,
          avgDailyCalories: avgDailyCalories,
          weightChange: null, // Placeholder - can be fetched from health tracker
        },
        nutritionTotals: todayTotals,
        nutritionGoals: nutritionGoals,
      },
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  getDashboard,
};
