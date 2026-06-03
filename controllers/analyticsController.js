const Meal = require('../models/Meal');
const WorkoutSession = require('../models/WorkoutSession');
const HealthTracker = require('../models/HealthTracker');
const User = require('../models/User');

// @route   GET /api/analytics
// @desc    Get comprehensive analytics data for the logged-in user
// @access  Private
const getAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = '4weeks' } = req.query; // 1week, 2weeks, 4weeks, 3months, 6months

    // Calculate date range based on period
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    const startDate = new Date(endDate);
    
    switch (period) {
      case '1week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '2weeks':
        startDate.setDate(endDate.getDate() - 14);
        break;
      case '4weeks':
        startDate.setDate(endDate.getDate() - 28);
        break;
      case '3months':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case '6months':
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      default:
        startDate.setDate(endDate.getDate() - 28);
    }
    startDate.setHours(0, 0, 0, 0);

    // Get user data
    const user = await User.findById(userId).select('onboardingData fullName');
    
    // Get meals data
    const meals = await Meal.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    });

    // Get workout sessions
    const workouts = await WorkoutSession.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    });

    // Get health tracker data
    const healthData = await HealthTracker.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 });

    // Calculate overall health score (0-100)
    const healthScore = calculateHealthScore(meals, workouts, healthData, user);

    // Calculate risk factors
    const riskFactors = calculateRiskFactors(meals, workouts, healthData, user);

    // Calculate goals achieved
    const goalsAchieved = calculateGoalsAchieved(meals, workouts, healthData, user, startDate, endDate);

    // Body composition trends
    const bodyCompositionTrends = calculateBodyCompositionTrends(healthData);

    // Calorie balance (weekly)
    const calorieBalance = calculateCalorieBalance(meals, workouts, startDate, endDate);

    // Workout performance
    const workoutPerformance = calculateWorkoutPerformance(workouts, startDate, endDate);

    // Nutrition trends
    const nutritionTrends = calculateNutritionTrends(meals, startDate, endDate);

    res.json({
      success: true,
      data: {
        overallHealthScore: healthScore,
        riskFactors,
        goalsAchieved,
        bodyCompositionTrends,
        calorieBalance,
        workoutPerformance,
        nutritionTrends,
        period,
      },
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Helper function to calculate overall health score (0-100)
const calculateHealthScore = (meals, workouts, healthData, user) => {
  let score = 50; // Base score

  // Nutrition score (0-30 points)
  if (meals.length > 0) {
    const avgCalories = meals.reduce((sum, m) => sum + (m.calories || 0), 0) / meals.length;
    const targetCalories = 2000; // Default, can be calculated from user data
    if (avgCalories >= targetCalories * 0.9 && avgCalories <= targetCalories * 1.1) {
      score += 30; // Within 10% of target
    } else if (avgCalories >= targetCalories * 0.8 && avgCalories <= targetCalories * 1.2) {
      score += 20; // Within 20% of target
    } else {
      score += 10;
    }
  }

  // Activity score (0-30 points)
  const completedWorkouts = workouts.filter(w => w.status === 'completed').length;
  const workoutFrequency = completedWorkouts / (healthData.length || 1) * 7; // workouts per week
  if (workoutFrequency >= 5) {
    score += 30;
  } else if (workoutFrequency >= 3) {
    score += 20;
  } else if (workoutFrequency >= 1) {
    score += 10;
  }

  // Health metrics score (0-20 points)
  if (healthData.length > 0) {
    const avgSteps = healthData.reduce((sum, h) => sum + (h.steps || 0), 0) / healthData.length;
    const avgWater = healthData.reduce((sum, h) => sum + (h.water || 0), 0) / healthData.length;
    const avgSleep = healthData.reduce((sum, h) => sum + (h.sleep || 0), 0) / healthData.length;

    if (avgSteps >= 8000) score += 7;
    else if (avgSteps >= 5000) score += 5;
    else if (avgSteps >= 3000) score += 3;

    if (avgWater >= 8) score += 7;
    else if (avgWater >= 6) score += 5;
    else if (avgWater >= 4) score += 3;

    if (avgSleep >= 7 && avgSleep <= 9) score += 6;
    else if (avgSleep >= 6 && avgSleep <= 10) score += 4;
    else score += 2;
  }

  // Consistency score (0-20 points)
  const daysWithActivity = new Set([
    ...meals.map(m => m.date.toISOString().split('T')[0]),
    ...workouts.map(w => w.date.toISOString().split('T')[0]),
  ]).size;
  const totalDays = Math.ceil((new Date() - new Date(new Date().setDate(new Date().getDate() - 28))) / (1000 * 60 * 60 * 24));
  const consistency = daysWithActivity / totalDays;
  score += Math.min(20, consistency * 20);

  return Math.min(100, Math.round(score));
};

// Calculate risk factors
const calculateRiskFactors = (meals, workouts, healthData, user) => {
  const factors = [];
  let riskLevel = 'Low';

  // Check various risk factors
  if (meals.length > 0) {
    const avgCalories = meals.reduce((sum, m) => sum + (m.calories || 0), 0) / meals.length;
    if (avgCalories < 1200) {
      factors.push('Very low calorie intake');
      riskLevel = 'Moderate';
    } else if (avgCalories > 3500) {
      factors.push('Very high calorie intake');
      riskLevel = 'Moderate';
    }
  }

  const completedWorkouts = workouts.filter(w => w.status === 'completed').length;
  if (completedWorkouts === 0 && healthData.length > 7) {
    factors.push('No workouts completed');
    if (riskLevel === 'Low') riskLevel = 'Moderate';
  }

  if (healthData.length > 0) {
    const avgSleep = healthData.reduce((sum, h) => sum + (h.sleep || 0), 0) / healthData.length;
    if (avgSleep < 5) {
      factors.push('Insufficient sleep');
      riskLevel = 'High';
    }
  }

  return {
    level: riskLevel,
    factors: factors.length > 0 ? factors : ['No significant risk factors detected'],
    status: riskLevel === 'Low' ? 'Healthy' : riskLevel === 'Moderate' ? 'Moderate' : 'High Risk',
  };
};

// Calculate goals achieved
const calculateGoalsAchieved = (meals, workouts, healthData, user, startDate, endDate) => {
  const goals = [];
  let achieved = 0;
  const total = 5; // Number of goals to track

  // Goal 1: Complete workouts
  const completedWorkouts = workouts.filter(w => w.status === 'completed').length;
  const workoutGoal = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24) / 7) * 3; // 3 workouts per week
  if (completedWorkouts >= workoutGoal) {
    achieved++;
    goals.push({ name: 'Complete weekly workouts', achieved: true });
  } else {
    goals.push({ name: 'Complete weekly workouts', achieved: false, progress: `${completedWorkouts}/${workoutGoal}` });
  }

  // Goal 2: Maintain nutrition goals
  if (meals.length > 0) {
    const avgCalories = meals.reduce((sum, m) => sum + (m.calories || 0), 0) / meals.length;
    const targetCalories = 2000; // Default
    if (avgCalories >= targetCalories * 0.9 && avgCalories <= targetCalories * 1.1) {
      achieved++;
      goals.push({ name: 'Maintain nutrition goals', achieved: true });
    } else {
      goals.push({ name: 'Maintain nutrition goals', achieved: false });
    }
  } else {
    goals.push({ name: 'Maintain nutrition goals', achieved: false });
  }

  // Goal 3: Daily steps
  if (healthData.length > 0) {
    const daysWithSteps = healthData.filter(h => (h.steps || 0) >= 8000).length;
    const daysGoal = Math.ceil(healthData.length * 0.7); // 70% of days
    if (daysWithSteps >= daysGoal) {
      achieved++;
      goals.push({ name: 'Daily step goal', achieved: true });
    } else {
      goals.push({ name: 'Daily step goal', achieved: false, progress: `${daysWithSteps}/${daysGoal} days` });
    }
  } else {
    goals.push({ name: 'Daily step goal', achieved: false });
  }

  // Goal 4: Water intake
  if (healthData.length > 0) {
    const daysWithWater = healthData.filter(h => (h.water || 0) >= 8).length;
    const daysGoal = Math.ceil(healthData.length * 0.7); // 70% of days
    if (daysWithWater >= daysGoal) {
      achieved++;
      goals.push({ name: 'Daily water intake', achieved: true });
    } else {
      goals.push({ name: 'Daily water intake', achieved: false, progress: `${daysWithWater}/${daysGoal} days` });
    }
  } else {
    goals.push({ name: 'Daily water intake', achieved: false });
  }

  // Goal 5: Consistency
  const daysWithActivity = new Set([
    ...meals.map(m => m.date.toISOString().split('T')[0]),
    ...workouts.map(w => w.date.toISOString().split('T')[0]),
  ]).size;
  const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  const consistencyRate = daysWithActivity / totalDays;
  if (consistencyRate >= 0.7) {
    achieved++;
    goals.push({ name: 'Maintain consistency', achieved: true });
  } else {
    goals.push({ name: 'Maintain consistency', achieved: false, progress: `${Math.round(consistencyRate * 100)}%` });
  }

  return {
    achieved,
    total,
    percentage: Math.round((achieved / total) * 100),
    goals,
  };
};

// Calculate body composition trends
const calculateBodyCompositionTrends = (healthData) => {
  // Group by week
  const weeklyData = {};
  healthData.forEach(h => {
    const date = new Date(h.date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = weekStart.toISOString().split('T')[0];
    
    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = { weight: [], steps: [], calories: [] };
    }
    if (h.weight) weeklyData[weekKey].weight.push(h.weight);
    if (h.steps) weeklyData[weekKey].steps.push(h.steps);
    if (h.caloriesBurned) weeklyData[weekKey].calories.push(h.caloriesBurned);
  });

  const trends = [];
  Object.keys(weeklyData).sort().forEach(weekKey => {
    const week = weeklyData[weekKey];
    trends.push({
      week: weekKey,
      weight: week.weight.length > 0 ? week.weight.reduce((a, b) => a + b, 0) / week.weight.length : null,
      steps: week.steps.length > 0 ? Math.round(week.steps.reduce((a, b) => a + b, 0) / week.steps.length) : 0,
      calories: week.calories.length > 0 ? Math.round(week.calories.reduce((a, b) => a + b, 0) / week.calories.length) : 0,
    });
  });

  return trends;
};

// Calculate calorie balance (weekly)
const calculateCalorieBalance = (meals, workouts, startDate, endDate) => {
  // Group by week
  const weeklyData = {};
  
  meals.forEach(meal => {
    const date = new Date(meal.date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = weekStart.toISOString().split('T')[0];
    
    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = { intake: 0, expenditure: 0 };
    }
    weeklyData[weekKey].intake += meal.calories || 0;
  });

  workouts.forEach(workout => {
    const date = new Date(workout.date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = weekStart.toISOString().split('T')[0];
    
    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = { intake: 0, expenditure: 0 };
    }
    weeklyData[weekKey].expenditure += workout.calories || 0;
  });

  const balance = [];
  Object.keys(weeklyData).sort().forEach(weekKey => {
    const week = weeklyData[weekKey];
    balance.push({
      week: weekKey,
      intake: Math.round(week.intake),
      expenditure: Math.round(week.expenditure),
      balance: Math.round(week.intake - week.expenditure),
    });
  });

  return balance;
};

// Calculate workout performance
const calculateWorkoutPerformance = (workouts, startDate, endDate) => {
  const completed = workouts.filter(w => w.status === 'completed');
  const totalDuration = completed.reduce((sum, w) => sum + (w.duration || 0), 0);
  const totalCalories = completed.reduce((sum, w) => sum + (w.calories || 0), 0);
  const avgDuration = completed.length > 0 ? Math.round(totalDuration / completed.length) : 0;
  const avgCalories = completed.length > 0 ? Math.round(totalCalories / completed.length) : 0;

  return {
    totalWorkouts: completed.length,
    totalDuration,
    totalCaloriesBurned: totalCalories,
    avgDuration,
    avgCaloriesBurned: avgCalories,
  };
};

// Helper function to calculate nutrition trends
const calculateNutritionTrends = (meals, startDate, endDate) => {
  // Group by week
  const weeklyData = {};
  
  meals.forEach(meal => {
    const date = new Date(meal.date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = weekStart.toISOString().split('T')[0];
    
    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = { calories: 0, protein: 0, carbs: 0, fats: 0, count: 0 };
    }
    weeklyData[weekKey].calories += meal.calories || 0;
    weeklyData[weekKey].protein += meal.protein || 0;
    weeklyData[weekKey].carbs += meal.carbs || 0;
    weeklyData[weekKey].fats += meal.fats || 0;
    weeklyData[weekKey].count++;
  });

  const trends = [];
  Object.keys(weeklyData).sort().forEach(weekKey => {
    const week = weeklyData[weekKey];
    trends.push({
      week: weekKey,
      calories: Math.round(week.calories / week.count),
      protein: Math.round(week.protein / week.count),
      carbs: Math.round(week.carbs / week.count),
      fats: Math.round(week.fats / week.count),
    });
  });

  return trends;
};

module.exports = {
  getAnalytics,
};

