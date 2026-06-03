const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getSystemStats,
  getAllRecipes,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} = require('../controllers/adminController');

// All routes require authentication + admin role
router.use(authenticateToken);
router.use(adminOnly);

router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/stats', getSystemStats);

router.get('/recipes', getAllRecipes);
router.post('/recipes', createRecipe);
router.put('/recipes/:id', updateRecipe);
router.delete('/recipes/:id', deleteRecipe);

module.exports = router;
