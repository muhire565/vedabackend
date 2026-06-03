const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getMeals,
  addMeal,
  updateMeal,
  deleteMeal,
  addMealFromRecipe,
} = require('../controllers/mealController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Validation rules
const mealValidation = [
  body('name').trim().notEmpty().withMessage('Meal name is required'),
  body('type')
    .isIn(['breakfast', 'mid-morning-snack', 'lunch', 'afternoon-snack', 'dinner', 'evening-snack'])
    .withMessage('Invalid meal type'),
  body('calories').isFloat({ min: 0 }).withMessage('Calories must be a positive number'),
  body('protein').isFloat({ min: 0 }).withMessage('Protein must be a positive number'),
  body('carbs').isFloat({ min: 0 }).withMessage('Carbs must be a positive number'),
  body('fats').isFloat({ min: 0 }).withMessage('Fats must be a positive number'),
  body('date').optional().isISO8601().withMessage('Invalid date format'),
  body('time').optional().isString(),
  body('description').optional().isString(),
  body('image').optional().isString(),
  body('recipeId').optional().isMongoId().withMessage('Invalid recipe ID'),
];

const mealFromRecipeValidation = [
  body('recipeId').isMongoId().withMessage('Recipe ID is required'),
  body('type')
    .isIn(['breakfast', 'mid-morning-snack', 'lunch', 'afternoon-snack', 'dinner', 'evening-snack'])
    .withMessage('Invalid meal type'),
  body('date').optional().isISO8601().withMessage('Invalid date format'),
  body('time').optional().isString(),
];

// Routes
router.get('/', authenticateToken, getMeals);
router.post('/', authenticateToken, mealValidation, addMeal);
router.put('/:id', authenticateToken, mealValidation, updateMeal);
router.delete('/:id', authenticateToken, deleteMeal);
router.post('/from-recipe', authenticateToken, mealFromRecipeValidation, addMealFromRecipe);

module.exports = router;
