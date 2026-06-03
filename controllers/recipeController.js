const Recipe = require('../models/Recipe');
const { validationResult } = require('express-validator');

// @route   GET /api/recipes
// @desc    Get all recipes (public and user's own)
// @access  Private
const getRecipes = async (req, res) => {
  try {
    const { search, difficulty, tags } = req.query;
    const userId = req.user.id;

    // Build query
    const query = {
      $or: [{ isPublic: true }, { createdBy: userId }],
    };

    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query.tags = { $in: tagArray };
    }

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    const recipes = await Recipe.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { recipes },
    });
  } catch (error) {
    console.error('Get recipes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recipes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @route   GET /api/recipes/:id
// @desc    Get single recipe by ID
// @access  Private
const getRecipeById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const recipe = await Recipe.findOne({
      _id: id,
      $or: [{ isPublic: true }, { createdBy: userId }],
    });

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found',
      });
    }

    res.json({
      success: true,
      data: { recipe },
    });
  } catch (error) {
    console.error('Get recipe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recipe',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @route   POST /api/recipes
// @desc    Create a new recipe
// @access  Private
const createRecipe = async (req, res) => {
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
      image,
      prepTime,
      calories,
      protein,
      carbs,
      fats,
      difficulty,
      tags,
      ingredients,
      instructions,
      servings,
    } = req.body;

    const userId = req.user.id;

    const recipe = new Recipe({
      name,
      description: description || '',
      image: image || '',
      prepTime: prepTime || '',
      calories: parseFloat(calories),
      protein: parseFloat(protein),
      carbs: parseFloat(carbs),
      fats: parseFloat(fats),
      difficulty: difficulty || 'Easy',
      tags: Array.isArray(tags) ? tags : [],
      ingredients: Array.isArray(ingredients) ? ingredients : [],
      instructions: Array.isArray(instructions) ? instructions : [],
      servings: servings ? parseInt(servings) : 1,
      createdBy: userId,
      isPublic: false, // User-created recipes are private by default
    });

    await recipe.save();

    res.status(201).json({
      success: true,
      message: 'Recipe created successfully',
      data: { recipe },
    });
  } catch (error) {
    console.error('Create recipe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create recipe',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  getRecipes,
  getRecipeById,
  createRecipe,
};
