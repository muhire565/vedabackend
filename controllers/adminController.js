const User = require('../models/User');
const HealthTracker = require('../models/HealthTracker');
const WorkoutPlan = require('../models/WorkoutPlan');
const Meal = require('../models/Meal');
const Recipe = require('../models/Recipe');

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        users: users.map((user) => ({
          id: user._id.toString(),
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          isEmailVerified: user.isEmailVerified,
          onboardingCompleted: user.onboardingCompleted,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        })),
      },
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
    });
  }
};

// @route   GET /api/admin/users/:id
// @desc    Get user by ID
// @access  Admin
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id.toString(),
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          isEmailVerified: user.isEmailVerified,
          onboardingCompleted: user.onboardingCompleted,
          onboardingData: user.onboardingData || {},
          role: user.role,
          notificationPreferences: user.notificationPreferences || {},
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error('Get user by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
    });
  }
};

// @route   PUT /api/admin/users/:id
// @desc    Update user (role, onboardingData, etc.)
// @access  Admin
const updateUser = async (req, res) => {
  try {
    const { fullName, phone, role, onboardingData, isEmailVerified } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;
    if (role && ['user', 'admin'].includes(role)) user.role = role;
    if (onboardingData) user.onboardingData = { ...user.onboardingData, ...onboardingData };
    if (typeof isEmailVerified === 'boolean') user.isEmailVerified = isEmailVerified;

    await user.save();

    const updatedUser = await User.findById(req.params.id).select('-password');

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: {
          id: updatedUser._id.toString(),
          fullName: updatedUser.fullName,
          email: updatedUser.email,
          phone: updatedUser.phone,
          isEmailVerified: updatedUser.isEmailVerified,
          onboardingCompleted: updatedUser.onboardingCompleted,
          role: updatedUser.role,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
    });
  }
};

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
// @access  Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account',
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
    });
  }
};

// @route   GET /api/admin/stats
// @desc    Get system statistics
// @access  Admin
const getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const verifiedUsers = await User.countDocuments({ isEmailVerified: true });
    const onboardedUsers = await User.countDocuments({ onboardingCompleted: true });
    const totalWorkoutPlans = await WorkoutPlan.countDocuments();
    const totalMeals = await Meal.countDocuments();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newUsersToday = await User.countDocuments({ createdAt: { $gte: today } });

    // Users by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const usersByMonth = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalAdmins,
          verifiedUsers,
          onboardedUsers,
          newUsersToday,
          totalWorkoutPlans,
          totalMeals,
          usersByMonth: usersByMonth.map((item) => ({
            month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
            count: item.count,
          })),
        },
      },
    });
  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system stats',
    });
  }
};

// @route   GET /api/admin/recipes
// @desc    Get all recipes (admin sees everything)
// @access  Admin
const getAllRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find().sort({ createdAt: -1 }).populate('createdBy', 'fullName email');

    res.json({
      success: true,
      data: {
        recipes: recipes.map((r) => ({
          id: r._id.toString(),
          name: r.name,
          description: r.description,
          image: r.image,
          prepTime: r.prepTime,
          calories: r.calories,
          protein: r.protein,
          carbs: r.carbs,
          fats: r.fats,
          difficulty: r.difficulty,
          tags: r.tags,
          ingredients: r.ingredients,
          instructions: r.instructions,
          servings: r.servings,
          isPublic: r.isPublic,
          createdBy: r.createdBy
            ? { id: r.createdBy._id.toString(), fullName: r.createdBy.fullName, email: r.createdBy.email }
            : null,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        })),
      },
    });
  } catch (error) {
    console.error('Get all recipes error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch recipes' });
  }
};

// @route   POST /api/admin/recipes
// @desc    Create a recipe (admin can create public system recipes)
// @access  Admin
const createRecipe = async (req, res) => {
  try {
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
      isPublic,
    } = req.body;

    const recipe = new Recipe({
      name,
      description: description || '',
      image: image || '',
      prepTime: prepTime || '',
      calories: parseFloat(calories) || 0,
      protein: parseFloat(protein) || 0,
      carbs: parseFloat(carbs) || 0,
      fats: parseFloat(fats) || 0,
      difficulty: difficulty || 'Easy',
      tags: Array.isArray(tags) ? tags : [],
      ingredients: Array.isArray(ingredients) ? ingredients : [],
      instructions: Array.isArray(instructions) ? instructions : [],
      servings: servings ? parseInt(servings) : 1,
      createdBy: req.user._id,
      isPublic: typeof isPublic === 'boolean' ? isPublic : true,
    });

    await recipe.save();

    res.status(201).json({
      success: true,
      message: 'Recipe created successfully',
      data: { recipe },
    });
  } catch (error) {
    console.error('Admin create recipe error:', error);
    res.status(500).json({ success: false, message: 'Failed to create recipe' });
  }
};

// @route   PUT /api/admin/recipes/:id
// @desc    Update a recipe
// @access  Admin
const updateRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
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
      isPublic,
    } = req.body;

    if (name) recipe.name = name;
    if (description !== undefined) recipe.description = description;
    if (image !== undefined) recipe.image = image;
    if (prepTime !== undefined) recipe.prepTime = prepTime;
    if (calories !== undefined) recipe.calories = parseFloat(calories);
    if (protein !== undefined) recipe.protein = parseFloat(protein);
    if (carbs !== undefined) recipe.carbs = parseFloat(carbs);
    if (fats !== undefined) recipe.fats = parseFloat(fats);
    if (difficulty) recipe.difficulty = difficulty;
    if (tags) recipe.tags = Array.isArray(tags) ? tags : [];
    if (ingredients) recipe.ingredients = Array.isArray(ingredients) ? ingredients : [];
    if (instructions) recipe.instructions = Array.isArray(instructions) ? instructions : [];
    if (servings !== undefined) recipe.servings = parseInt(servings);
    if (typeof isPublic === 'boolean') recipe.isPublic = isPublic;

    await recipe.save();

    res.json({ success: true, message: 'Recipe updated successfully', data: { recipe } });
  } catch (error) {
    console.error('Admin update recipe error:', error);
    res.status(500).json({ success: false, message: 'Failed to update recipe' });
  }
};

// @route   DELETE /api/admin/recipes/:id
// @desc    Delete a recipe
// @access  Admin
const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    await Recipe.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error('Admin delete recipe error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete recipe' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getSystemStats,
  getAllRecipes,
  createRecipe,
  updateRecipe,
  deleteRecipe,
};
