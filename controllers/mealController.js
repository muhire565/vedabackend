const Meal = require('../models/Meal');
const { validationResult } = require('express-validator');

// @route   GET /api/meals
// @desc    Get user's meals for a specific date or date range
// @access  Private
const getMeals = async (req, res) => {
  try {
    const { date } = req.query;
    const userId = req.user.id;

    // Parse date or use today
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const startOfDay = new Date(targetDate);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const meals = await Meal.find({
      userId,
      date: { $gte: startOfDay, $lte: endOfDay },
    }).sort({ time: 1 });

    // Calculate totals
    const totals = meals.reduce(
      (acc, meal) => {
        acc.calories += meal.calories;
        acc.protein += meal.protein;
        acc.carbs += meal.carbs;
        acc.fats += meal.fats;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

    res.json({
      success: true,
      data: {
        meals,
        totals,
      },
    });
  } catch (error) {
    console.error('Get meals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch meals',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @route   POST /api/meals
// @desc    Add a new meal
// @access  Private
const addMeal = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const {
      name,
      description,
      type,
      date,
      calories,
      protein,
      carbs,
      fats,
      image,
      time,
      recipeId,
    } = req.body;

    const userId = req.user.id;

    // Parse date
    const mealDate = date ? new Date(date) : new Date();
    mealDate.setHours(0, 0, 0, 0);

    const meal = new Meal({
      userId,
      name,
      description: description || '',
      type,
      date: mealDate,
      calories: parseFloat(calories),
      protein: parseFloat(protein),
      carbs: parseFloat(carbs),
      fats: parseFloat(fats),
      image: image || '',
      time: time || '',
      logged: true,
      isCustom: true,
      recipeId: recipeId || null,
    });

    await meal.save();

    res.status(201).json({
      success: true,
      message: 'Meal added successfully',
      data: { meal },
    });
  } catch (error) {
    console.error('Add meal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add meal',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @route   PUT /api/meals/:id
// @desc    Update a meal
// @access  Private
const updateMeal = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const userId = req.user.id;

    const meal = await Meal.findOne({ _id: id, userId });

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Meal not found',
      });
    }

    const {
      name,
      description,
      type,
      date,
      calories,
      protein,
      carbs,
      fats,
      image,
      time,
      logged,
    } = req.body;

    // Update fields
    if (name) meal.name = name;
    if (description !== undefined) meal.description = description;
    if (type) meal.type = type;
    if (date) {
      const mealDate = new Date(date);
      mealDate.setHours(0, 0, 0, 0);
      meal.date = mealDate;
    }
    if (calories !== undefined) meal.calories = parseFloat(calories);
    if (protein !== undefined) meal.protein = parseFloat(protein);
    if (carbs !== undefined) meal.carbs = parseFloat(carbs);
    if (fats !== undefined) meal.fats = parseFloat(fats);
    if (image !== undefined) meal.image = image;
    if (time !== undefined) meal.time = time;
    if (logged !== undefined) meal.logged = logged;

    await meal.save();

    res.json({
      success: true,
      message: 'Meal updated successfully',
      data: { meal },
    });
  } catch (error) {
    console.error('Update meal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update meal',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @route   DELETE /api/meals/:id
// @desc    Delete a meal
// @access  Private
const deleteMeal = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const meal = await Meal.findOneAndDelete({ _id: id, userId });

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Meal not found',
      });
    }

    res.json({
      success: true,
      message: 'Meal deleted successfully',
    });
  } catch (error) {
    console.error('Delete meal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete meal',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @route   POST /api/meals/from-recipe
// @desc    Add a meal from a recipe
// @access  Private
const addMealFromRecipe = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { recipeId, type, date, time } = req.body;
    const Recipe = require('../models/Recipe');
    const userId = req.user.id;

    const recipe = await Recipe.findById(recipeId);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found',
      });
    }

    // Parse date
    const mealDate = date ? new Date(date) : new Date();
    mealDate.setHours(0, 0, 0, 0);

    const meal = new Meal({
      userId,
      name: recipe.name,
      description: recipe.description,
      type,
      date: mealDate,
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fats: recipe.fats,
      image: recipe.image,
      time: time || '',
      logged: true,
      isCustom: false,
      recipeId: recipe._id,
    });

    await meal.save();

    res.status(201).json({
      success: true,
      message: 'Meal added from recipe successfully',
      data: { meal },
    });
  } catch (error) {
    console.error('Add meal from recipe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add meal from recipe',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  getMeals,
  addMeal,
  updateMeal,
  deleteMeal,
  addMealFromRecipe,
};
