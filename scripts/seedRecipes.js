const mongoose = require('mongoose');
require('dotenv').config();
const Recipe = require('../models/Recipe');

// Sample recipes with different images
const recipes = [
  {
    name: 'High-Protein Breakfast Bowl',
    description: 'A nutritious and filling breakfast with protein, fruits, and healthy fats',
    image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&q=80',
    prepTime: '15 min',
    calories: 450,
    protein: 28,
    carbs: 52,
    fats: 12,
    difficulty: 'Easy',
    tags: ['High Protein', 'Breakfast', 'Vegetarian'],
    ingredients: [
      '1 cup rolled oats',
      '1 scoop protein powder',
      '1/2 cup mixed berries',
      '1/4 cup almonds',
      '1 tbsp honey',
      '1/2 cup Greek yogurt',
    ],
    instructions: [
      'Cook oats according to package instructions',
      'Mix in protein powder while warm',
      'Top with berries, almonds, and yogurt',
      'Drizzle with honey',
      'Serve immediately',
    ],
    servings: 1,
    isPublic: true,
  },
  {
    name: 'Mediterranean Quinoa Salad',
    description: 'A refreshing and healthy salad packed with protein and vegetables',
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80',
    prepTime: '20 min',
    calories: 380,
    protein: 15,
    carbs: 45,
    fats: 14,
    difficulty: 'Easy',
    tags: ['Lunch', 'Vegan', 'High Fiber'],
    ingredients: [
      '1 cup cooked quinoa',
      '1/2 cup cherry tomatoes',
      '1/2 cucumber, diced',
      '1/4 cup red onion',
      '1/4 cup feta cheese',
      '2 tbsp olive oil',
      '1 tbsp lemon juice',
      'Fresh herbs (parsley, mint)',
    ],
    instructions: [
      'Cook quinoa and let cool',
      'Dice tomatoes, cucumber, and onion',
      'Mix vegetables with quinoa',
      'Add feta cheese',
      'Dress with olive oil and lemon juice',
      'Garnish with fresh herbs',
    ],
    servings: 2,
    isPublic: true,
  },
  {
    name: 'Grilled Chicken Meal Prep',
    description: 'Lean protein with vegetables - perfect for meal prep',
    image: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=800&q=80',
    prepTime: '30 min',
    calories: 520,
    protein: 48,
    carbs: 35,
    fats: 18,
    difficulty: 'Medium',
    tags: ['High Protein', 'Meal Prep', 'Dinner'],
    ingredients: [
      '200g chicken breast',
      '1 cup brown rice',
      '1 cup broccoli',
      '1/2 bell pepper',
      '1 tbsp olive oil',
      'Salt and pepper',
      'Garlic powder',
    ],
    instructions: [
      'Season chicken with salt, pepper, and garlic powder',
      'Grill chicken for 6-7 minutes per side',
      'Cook brown rice according to package',
      'Steam broccoli and bell pepper',
      'Let chicken rest, then slice',
      'Portion into meal prep containers',
    ],
    servings: 1,
    isPublic: true,
  },
  {
    name: 'Veggie Stir-Fry',
    description: 'Quick and healthy vegetable stir-fry with tofu',
    image: 'https://images.unsplash.com/photo-1563379091339-03246963d19a?w=800&q=80',
    prepTime: '25 min',
    calories: 320,
    protein: 18,
    carbs: 42,
    fats: 10,
    difficulty: 'Easy',
    tags: ['Vegan', 'Low Calorie', 'Dinner'],
    ingredients: [
      '200g firm tofu',
      '1 cup mixed vegetables',
      '1/2 cup bell peppers',
      '1/4 cup mushrooms',
      '2 tbsp soy sauce',
      '1 tbsp sesame oil',
      '1 clove garlic',
      'Ginger, grated',
    ],
    instructions: [
      'Press tofu and cut into cubes',
      'Heat sesame oil in a wok',
      'Add garlic and ginger',
      'Stir-fry tofu until golden',
      'Add vegetables and stir-fry',
      'Season with soy sauce',
      'Serve hot',
    ],
    servings: 2,
    isPublic: true,
  },
  {
    name: 'Protein Smoothie Bowl',
    description: 'A refreshing smoothie bowl topped with fruits and nuts',
    image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&q=80',
    prepTime: '10 min',
    calories: 350,
    protein: 25,
    carbs: 45,
    fats: 8,
    difficulty: 'Easy',
    tags: ['High Protein', 'Breakfast', 'Quick'],
    ingredients: [
      '1 banana',
      '1/2 cup frozen berries',
      '1 scoop protein powder',
      '1/2 cup almond milk',
      '1/4 cup granola',
      'Fresh berries for topping',
      'Chia seeds',
    ],
    instructions: [
      'Blend banana, berries, protein powder, and almond milk',
      'Pour into a bowl',
      'Top with granola, fresh berries, and chia seeds',
      'Serve immediately',
    ],
    servings: 1,
    isPublic: true,
  },
  {
    name: 'Salmon with Roasted Vegetables',
    description: 'Omega-3 rich salmon with colorful roasted vegetables',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80',
    prepTime: '35 min',
    calories: 480,
    protein: 38,
    carbs: 28,
    fats: 22,
    difficulty: 'Medium',
    tags: ['High Protein', 'Dinner', 'Omega-3'],
    ingredients: [
      '150g salmon fillet',
      '1 cup mixed vegetables',
      '1/2 sweet potato',
      '1 tbsp olive oil',
      'Lemon',
      'Fresh dill',
      'Salt and pepper',
    ],
    instructions: [
      'Preheat oven to 400°F',
      'Season salmon with salt, pepper, and dill',
      'Roast vegetables with olive oil',
      'Bake salmon for 12-15 minutes',
      'Serve with lemon wedge',
    ],
    servings: 1,
    isPublic: true,
  },
];

const seedRecipes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const inserted = await Recipe.insertMany(recipes);
    console.log(`✅ Seeded ${inserted.length} recipes successfully`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding recipes:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedRecipes();
}

module.exports = { seedRecipes };

