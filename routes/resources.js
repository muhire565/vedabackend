const express = require('express');
const router = express.Router();
const { getResources, getResourceById, getCategories } = require('../controllers/resourceController');

// Routes
router.get('/', getResources);
router.get('/categories', getCategories);
router.get('/:id', getResourceById);

module.exports = router;

