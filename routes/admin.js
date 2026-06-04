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
  getAllResources,
  createResource,
  updateResource,
  deleteResource,
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

router.get('/resources', getAllResources);
router.post('/resources', createResource);
router.put('/resources/:id', updateResource);
router.delete('/resources/:id', deleteResource);

module.exports = router;
