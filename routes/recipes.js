const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getRecipes, getRecipeById, createRecipe } = require('../controllers/recipeController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Validation rules
const recipeValidation = [
  body('name').trim().notEmpty().withMessage('Recipe name is required'),
  body('calories').isFloat({ min: 0 }).withMessage('Calories must be a positive number'),
  body('protein').isFloat({ min: 0 }).withMessage('Protein must be a positive number'),
  body('carbs').isFloat({ min: 0 }).withMessage('Carbs must be a positive number'),
  body('fats').isFloat({ min: 0 }).withMessage('Fats must be a positive number'),
  body('difficulty').optional().isIn(['Easy', 'Medium', 'Hard']).withMessage('Invalid difficulty'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('ingredients').optional().isArray().withMessage('Ingredients must be an array'),
  body('instructions').optional().isArray().withMessage('Instructions must be an array'),
  body('servings').optional().isInt({ min: 1 }).withMessage('Servings must be a positive integer'),
  body('description').optional().isString(),
  body('image').optional().isString(),
  body('prepTime').optional().isString(),
];

// Routes
router.get('/', authenticateToken, getRecipes);
router.get('/:id', authenticateToken, getRecipeById);
router.post('/', authenticateToken, recipeValidation, createRecipe);

module.exports = router;
