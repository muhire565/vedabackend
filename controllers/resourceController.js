const Resource = require('../models/Resource');
const { validationResult } = require('express-validator');

// @route   GET /api/resources
// @desc    Get all resources with filtering and search
// @access  Public (or Private if you want to track views)
const getResources = async (req, res) => {
  try {
    const {
      type,
      category,
      search,
      featured,
      limit = 20,
      page = 1,
    } = req.query;

    // Build query
    const query = { published: true };

    if (type) {
      query.type = type;
    }

    if (category) {
      query.category = category;
    }

    if (featured === 'true') {
      query.featured = true;
    }

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Execute query
    const resources = await Resource.find(query)
      .sort(featured === 'true' ? { featured: -1, publishedAt: -1 } : { publishedAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .select('-content'); // Don't send full content in list view

    const total = await Resource.countDocuments(query);

    res.json({
      success: true,
      data: {
        resources,
        pagination: {
          page: parseInt(page),
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resources',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @route   GET /api/resources/:id
// @desc    Get single resource by ID
// @access  Public
const getResourceById = async (req, res) => {
  try {
    const { id } = req.params;

    const resource = await Resource.findById(id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    if (!resource.published) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    // Increment views (use findByIdAndUpdate to avoid triggering save hook)
    const updatedResource = await Resource.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    );

    res.json({
      success: true,
      data: {
        resource: updatedResource,
      },
    });
  } catch (error) {
    console.error('Get resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resource',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @route   GET /api/resources/categories
// @desc    Get all categories with counts
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Resource.aggregate([
      { $match: { published: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        categories: categories.map((cat) => ({
          name: cat._id,
          count: cat.count,
        })),
      },
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
    });
  }
};

module.exports = {
  getResources,
  getResourceById,
  getCategories,
};

