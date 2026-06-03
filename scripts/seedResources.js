const mongoose = require('mongoose');
require('dotenv').config();
const Resource = require('../models/Resource');

// Sample resources data aligned with Medifit AI goals
const resources = [
  // Articles
  {
    title: 'Understanding Non-Communicable Diseases (NCDs)',
    description: 'A comprehensive guide to preventing lifestyle-related diseases through proper diet and exercise',
    type: 'article',
    category: 'health-education',
    content: `# Understanding Non-Communicable Diseases (NCDs)

Non-Communicable Diseases (NCDs) are chronic conditions that are not passed from person to person. They develop slowly over time and are often linked to lifestyle factors.

## Common Types of NCDs

1. **Cardiovascular Diseases** - Heart disease, stroke
2. **Diabetes** - Type 2 diabetes, often preventable
3. **Cancer** - Various types linked to lifestyle
4. **Chronic Respiratory Diseases** - COPD, asthma
5. **Mental Health Disorders** - Depression, anxiety

## Prevention Through Lifestyle

### Diet
- Eat a balanced diet rich in fruits and vegetables
- Limit processed foods and added sugars
- Control portion sizes
- Stay hydrated

### Exercise
- Aim for at least 150 minutes of moderate exercise per week
- Include strength training 2-3 times per week
- Stay active throughout the day
- Find activities you enjoy

### Other Factors
- Get adequate sleep (7-9 hours)
- Manage stress effectively
- Avoid smoking and limit alcohol
- Regular health check-ups

## Early Detection

Regular health screenings can help detect NCDs early when they're most treatable. Talk to your healthcare provider about appropriate screening schedules based on your age and risk factors.

Remember: Prevention is always better than cure. Small lifestyle changes today can significantly reduce your risk of developing NCDs in the future.`,
    thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
    duration: 15,
    author: 'Medifit AI Team',
    tags: ['health', 'prevention', 'lifestyle', 'wellness'],
    featured: true,
  },
  {
    title: 'The Science of Weight Loss: A Complete Guide',
    description: 'Learn the fundamentals of sustainable weight loss through evidence-based approaches',
    type: 'article',
    category: 'nutrition',
    content: `# The Science of Weight Loss: A Complete Guide

Weight loss is a complex process that involves multiple factors. Understanding the science can help you achieve sustainable results.

## The Calorie Equation

Weight loss occurs when you burn more calories than you consume. This is called a calorie deficit.

### Creating a Calorie Deficit

1. **Calculate Your Maintenance Calories**
   - Use online calculators or consult with a nutritionist
   - Factor in your activity level

2. **Create a Moderate Deficit**
   - Aim for 500-750 calories per day
   - This typically results in 0.5-1 kg loss per week

3. **Track Your Intake**
   - Use food tracking apps
   - Be honest and consistent

## Macronutrients Matter

### Protein (25-30% of calories)
- Preserves muscle mass during weight loss
- Increases satiety
- Boosts metabolism slightly

### Carbohydrates (40-50% of calories)
- Choose complex carbs (whole grains, vegetables)
- Limit refined sugars
- Time carbs around workouts if active

### Fats (20-30% of calories)
- Essential for hormone production
- Choose healthy fats (avocado, nuts, olive oil)
- Don't eliminate fats completely

## Exercise for Weight Loss

### Cardio
- Burns calories during activity
- Improves cardiovascular health
- Aim for 150-300 minutes per week

### Strength Training
- Builds muscle (increases metabolism)
- Burns calories after workout
- 2-3 sessions per week recommended

## Common Mistakes

1. **Too Aggressive Deficit** - Can lead to muscle loss and metabolic slowdown
2. **Ignoring Strength Training** - Muscle loss during weight loss
3. **Not Tracking Accurately** - Underestimating portions
4. **All-or-Nothing Thinking** - One bad meal doesn't ruin progress

## Sustainable Approach

- Make gradual changes
- Focus on habits, not just numbers
- Be patient - sustainable weight loss takes time
- Seek support when needed

Remember: The best weight loss plan is one you can maintain long-term.`,
    thumbnail: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
    duration: 12,
    author: 'Medifit AI Team',
    tags: ['weight-loss', 'nutrition', 'fitness', 'science'],
    featured: false,
  },
  {
    title: 'Building Muscle: A Beginner\'s Guide',
    description: 'Essential tips for starting your muscle-building journey safely and effectively',
    type: 'article',
    category: 'fitness',
    content: `# Building Muscle: A Beginner's Guide

Building muscle requires a combination of proper training, nutrition, and recovery. Here's how to get started.

## The Fundamentals

### Progressive Overload
- Gradually increase weight, reps, or sets
- Challenge your muscles consistently
- Track your progress

### Compound Movements
Focus on exercises that work multiple muscle groups:
- Squats
- Deadlifts
- Bench Press
- Rows
- Overhead Press

### Training Frequency
- Beginners: 3-4 times per week
- Allow 48 hours between training same muscle groups
- Full-body or upper/lower splits work well

## Nutrition for Muscle Growth

### Protein
- Aim for 1.6-2.2g per kg of body weight
- Distribute throughout the day
- Include post-workout protein

### Calories
- Slight surplus (200-500 calories) for muscle gain
- Focus on quality foods
- Don't overeat - excess becomes fat

### Timing
- Pre-workout: Carbs for energy
- Post-workout: Protein + carbs for recovery
- Overall daily intake matters most

## Recovery

### Sleep
- 7-9 hours per night
- Quality sleep is crucial for growth hormone

### Rest Days
- Active recovery (light walking, stretching)
- Complete rest when needed
- Listen to your body

## Common Mistakes

1. **Too Much Volume** - More isn't always better
2. **Poor Form** - Technique over weight
3. **Inadequate Protein** - Not eating enough
4. **Skipping Recovery** - Overtraining

## Getting Started

1. Learn proper form first
2. Start with bodyweight or light weights
3. Focus on consistency
4. Be patient - results take time

Remember: Building muscle is a marathon, not a sprint. Consistency and proper technique will yield the best results.`,
    thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
    duration: 10,
    author: 'Medifit AI Team',
    tags: ['muscle-building', 'strength-training', 'fitness', 'beginner'],
    featured: false,
  },
  // Videos (using YouTube embed URLs)
  {
    title: 'Full Body Workout for Beginners',
    description: 'A complete 30-minute full body workout perfect for beginners',
    type: 'video',
    category: 'workout-guides',
    content: 'Complete full body workout routine',
    videoUrl: 'https://www.youtube.com/embed/vT2GjY_Umpw', // Example - replace with actual fitness video
    thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
    duration: 30,
    author: 'Medifit AI Team',
    tags: ['workout', 'beginner', 'full-body', 'exercise'],
    featured: true,
  },
  {
    title: 'Meal Prep Sunday: Healthy Recipes',
    description: 'Learn how to meal prep for the week with these healthy, delicious recipes',
    type: 'video',
    category: 'meal-planning',
    content: 'Meal prep guide and recipes',
    videoUrl: 'https://www.youtube.com/embed/2S8HoLmJp-s', // Example - replace with actual meal prep video
    thumbnail: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80',
    duration: 25,
    author: 'Medifit AI Team',
    tags: ['meal-prep', 'nutrition', 'recipes', 'cooking'],
    featured: false,
  },
  {
    title: 'Yoga for Stress Relief',
    description: 'Gentle yoga flow to reduce stress and improve flexibility',
    type: 'video',
    category: 'wellness',
    content: 'Yoga practice for stress management',
    videoUrl: 'https://www.youtube.com/watch?v=sTANio_2E0Q', // Example - replace with actual yoga video
    thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
    duration: 20,
    author: 'Medifit AI Team',
    tags: ['yoga', 'stress-relief', 'wellness', 'flexibility'],
    featured: false,
  },
];

const seedResources = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing resources (optional - comment out if you want to keep existing)
    // await Resource.deleteMany({});
    // console.log('Cleared existing resources');

    // Insert resources
    const inserted = await Resource.insertMany(resources);
    console.log(`✅ Seeded ${inserted.length} resources successfully`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding resources:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  seedResources();
}

module.exports = { seedResources };

