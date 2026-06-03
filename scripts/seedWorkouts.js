require('dotenv').config();
const mongoose = require('mongoose');
const WorkoutPlan = require('../models/WorkoutPlan');

// Sample workout plans with exercises
const workoutPlans = [
  {
    name: 'Beginner Full Body',
    description: 'Perfect for beginners looking to build strength and endurance with full-body workouts',
    duration: 8, // weeks
    difficulty: 'Beginner',
    goal: 'overall-fitness',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80',
    totalWorkouts: 24,
    isPublic: true,
    isActive: false,
    workouts: [
      // Week 1
      { week: 1, day: 1, name: 'Full Body Strength', description: 'Monday workout', duration: 30, calories: 200, difficulty: 'Beginner', exercises: [
        { name: 'Warm-up', type: 'warmup', duration: '5 min' },
        { name: 'Bodyweight Squats', type: 'exercise', sets: '3', reps: '10' },
        { name: 'Push-ups', type: 'exercise', sets: '3', reps: '8' },
        { name: 'Plank', type: 'exercise', duration: '3x30s' },
        { name: 'Cool down', type: 'cooldown', duration: '5 min' },
      ]},
      { week: 1, day: 2, name: 'Rest Day', description: 'Rest and recovery', duration: 0, calories: 0, difficulty: 'Beginner', exercises: []},
      { week: 1, day: 3, name: 'Cardio Light', description: 'Wednesday cardio', duration: 20, calories: 150, difficulty: 'Beginner', exercises: [
        { name: 'Warm-up', type: 'warmup', duration: '5 min' },
        { name: 'Walking/Jogging', type: 'exercise', duration: '10 min' },
        { name: 'Cool down', type: 'cooldown', duration: '5 min' },
      ]},
      { week: 1, day: 4, name: 'Rest Day', description: 'Rest and recovery', duration: 0, calories: 0, difficulty: 'Beginner', exercises: []},
      { week: 1, day: 5, name: 'Full Body Strength', description: 'Friday workout', duration: 30, calories: 200, difficulty: 'Beginner', exercises: [
        { name: 'Warm-up', type: 'warmup', duration: '5 min' },
        { name: 'Lunges', type: 'exercise', sets: '3', reps: '8 each leg' },
        { name: 'Modified Push-ups', type: 'exercise', sets: '3', reps: '8' },
        { name: 'Leg Raises', type: 'exercise', sets: '3', reps: '10' },
        { name: 'Cool down', type: 'cooldown', duration: '5 min' },
      ]},
      { week: 1, day: 6, name: 'Active Recovery', description: 'Light activity', duration: 15, calories: 100, difficulty: 'Beginner', exercises: [
        { name: 'Gentle Stretching', type: 'exercise', duration: '15 min' },
      ]},
      { week: 1, day: 0, name: 'Rest Day', description: 'Rest day', duration: 0, calories: 0, difficulty: 'Beginner', exercises: []},
    ],
  },
  {
    name: 'Weight Loss & Toning',
    description: 'High-intensity workouts designed to burn calories and tone your body',
    duration: 12, // weeks
    difficulty: 'Intermediate',
    goal: 'weight-loss',
    image: 'https://images.unsplash.com/photo-1584827387179-355517d8a5fb?w=400&q=80',
    totalWorkouts: 48,
    isPublic: true,
    isActive: false,
    workouts: [
      // Week 1
      { week: 1, day: 1, name: 'Upper Body Strength', description: 'Monday upper body', duration: 45, calories: 320, difficulty: 'Intermediate', exercises: [
        { name: 'Warm-up', type: 'warmup', duration: '5 min' },
        { name: 'Push-ups', type: 'exercise', sets: '4', reps: '12' },
        { name: 'Dumbbell Rows', type: 'exercise', sets: '4', reps: '10' },
        { name: 'Shoulder Press', type: 'exercise', sets: '3', reps: '10' },
        { name: 'Tricep Dips', type: 'exercise', sets: '3', reps: '12' },
        { name: 'Cool down', type: 'cooldown', duration: '5 min' },
      ]},
      { week: 1, day: 2, name: 'Cardio HIIT', description: 'Tuesday HIIT', duration: 30, calories: 350, difficulty: 'Intermediate', exercises: [
        { name: 'Warm-up', type: 'warmup', duration: '5 min' },
        { name: 'Jumping Jacks', type: 'exercise', sets: '5', reps: '30s on, 30s off' },
        { name: 'Burpees', type: 'exercise', sets: '4', reps: '10' },
        { name: 'Mountain Climbers', type: 'exercise', sets: '4', reps: '30s' },
        { name: 'Cool down', type: 'cooldown', duration: '5 min' },
      ]},
      { week: 1, day: 3, name: 'Rest Day', description: 'Rest and recovery', duration: 0, calories: 0, difficulty: 'Intermediate', exercises: []},
      { week: 1, day: 4, name: 'Full Body Strength', description: 'Thursday full body', duration: 45, calories: 380, difficulty: 'Intermediate', exercises: [
        { name: 'Warm-up', type: 'warmup', duration: '5 min' },
        { name: 'Squats', type: 'exercise', sets: '4', reps: '12' },
        { name: 'Push-ups', type: 'exercise', sets: '3', reps: '15' },
        { name: 'Lunges', type: 'exercise', sets: '3', reps: '10 each leg' },
        { name: 'Plank', type: 'exercise', duration: '3x60s' },
        { name: 'Cool down', type: 'cooldown', duration: '5 min' },
      ]},
      { week: 1, day: 5, name: 'Core & Flexibility', description: 'Friday core', duration: 30, calories: 250, difficulty: 'Intermediate', exercises: [
        { name: 'Warm-up', type: 'warmup', duration: '5 min' },
        { name: 'Plank Variations', type: 'exercise', sets: '3', reps: '45s each' },
        { name: 'Russian Twists', type: 'exercise', sets: '3', reps: '20' },
        { name: 'Leg Raises', type: 'exercise', sets: '3', reps: '15' },
        { name: 'Stretching', type: 'cooldown', duration: '10 min' },
      ]},
      { week: 1, day: 6, name: 'Cardio Endurance', description: 'Saturday cardio', duration: 40, calories: 400, difficulty: 'Intermediate', exercises: [
        { name: 'Warm-up', type: 'warmup', duration: '5 min' },
        { name: 'Running/Jogging', type: 'exercise', duration: '30 min' },
        { name: 'Cool down', type: 'cooldown', duration: '5 min' },
      ]},
      { week: 1, day: 0, name: 'Active Recovery', description: 'Sunday recovery', duration: 20, calories: 150, difficulty: 'Intermediate', exercises: [
        { name: 'Yoga/Stretching', type: 'exercise', duration: '20 min' },
      ]},
    ],
  },
  {
    name: 'Muscle Building Pro',
    description: 'Advanced program for serious muscle building and strength gains',
    duration: 12, // weeks
    difficulty: 'Advanced',
    goal: 'muscle-gain',
    image: 'https://images.unsplash.com/photo-1729280860113-82372b7afad6?w=400&q=80',
    totalWorkouts: 48,
    isPublic: true,
    isActive: false,
    workouts: [
      // Week 1
      { week: 1, day: 1, name: 'Chest & Triceps', description: 'Monday chest focus', duration: 60, calories: 450, difficulty: 'Advanced', exercises: [
        { name: 'Warm-up', type: 'warmup', duration: '10 min' },
        { name: 'Bench Press', type: 'exercise', sets: '5', reps: '8-10' },
        { name: 'Incline Dumbbell Press', type: 'exercise', sets: '4', reps: '10' },
        { name: 'Dips', type: 'exercise', sets: '4', reps: '12' },
        { name: 'Tricep Extension', type: 'exercise', sets: '3', reps: '12' },
        { name: 'Cool down', type: 'cooldown', duration: '10 min' },
      ]},
      { week: 1, day: 2, name: 'Back & Biceps', description: 'Tuesday back focus', duration: 60, calories: 450, difficulty: 'Advanced', exercises: [
        { name: 'Warm-up', type: 'warmup', duration: '10 min' },
        { name: 'Deadlifts', type: 'exercise', sets: '5', reps: '6-8' },
        { name: 'Pull-ups', type: 'exercise', sets: '4', reps: '10' },
        { name: 'Barbell Rows', type: 'exercise', sets: '4', reps: '10' },
        { name: 'Bicep Curls', type: 'exercise', sets: '3', reps: '12' },
        { name: 'Cool down', type: 'cooldown', duration: '10 min' },
      ]},
      { week: 1, day: 3, name: 'Rest Day', description: 'Rest and recovery', duration: 0, calories: 0, difficulty: 'Advanced', exercises: []},
      { week: 1, day: 4, name: 'Legs & Shoulders', description: 'Thursday legs focus', duration: 60, calories: 500, difficulty: 'Advanced', exercises: [
        { name: 'Warm-up', type: 'warmup', duration: '10 min' },
        { name: 'Squats', type: 'exercise', sets: '5', reps: '8-10' },
        { name: 'Leg Press', type: 'exercise', sets: '4', reps: '12' },
        { name: 'Shoulder Press', type: 'exercise', sets: '4', reps: '10' },
        { name: 'Lateral Raises', type: 'exercise', sets: '3', reps: '12' },
        { name: 'Cool down', type: 'cooldown', duration: '10 min' },
      ]},
      { week: 1, day: 5, name: 'Upper Body', description: 'Friday upper body', duration: 50, calories: 400, difficulty: 'Advanced', exercises: [
        { name: 'Warm-up', type: 'warmup', duration: '10 min' },
        { name: 'Pull-ups', type: 'exercise', sets: '4', reps: '10' },
        { name: 'Dumbbell Press', type: 'exercise', sets: '4', reps: '10' },
        { name: 'Rows', type: 'exercise', sets: '4', reps: '12' },
        { name: 'Cool down', type: 'cooldown', duration: '10 min' },
      ]},
      { week: 1, day: 6, name: 'Cardio & Core', description: 'Saturday conditioning', duration: 40, calories: 350, difficulty: 'Advanced', exercises: [
        { name: 'Warm-up', type: 'warmup', duration: '5 min' },
        { name: 'Running', type: 'exercise', duration: '20 min' },
        { name: 'Core Circuit', type: 'exercise', sets: '3', reps: '15 each' },
        { name: 'Cool down', type: 'cooldown', duration: '5 min' },
      ]},
      { week: 1, day: 0, name: 'Rest Day', description: 'Rest day', duration: 0, calories: 0, difficulty: 'Advanced', exercises: []},
    ],
  },
];

// Connect to MongoDB
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('❌ MONGO_URI is not defined in environment variables');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Seed workout plans
const seedWorkouts = async () => {
  try {
    await connectDB();

    // Clear existing public workout plans (optional - comment out if you want to keep existing)
    // await WorkoutPlan.deleteMany({ isPublic: true });

    // Check if plans already exist
    const existingPlans = await WorkoutPlan.countDocuments({ isPublic: true });
    if (existingPlans > 0) {
      console.log(`ℹ️  Found ${existingPlans} existing workout plans. Skipping seed.`);
      console.log('   If you want to re-seed, delete existing plans first.');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Insert workout plans
    const insertedPlans = await WorkoutPlan.insertMany(workoutPlans);
    console.log(`✅ Successfully seeded ${insertedPlans.length} workout plans:`);
    insertedPlans.forEach(plan => {
      console.log(`   - ${plan.name} (${plan.duration} weeks, ${plan.totalWorkouts} workouts)`);
    });

    await mongoose.connection.close();
    console.log('✅ Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding workout plans:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run seeding
seedWorkouts();

