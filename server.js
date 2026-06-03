require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const seedAdmin = require('./scripts/seedAdmin');

// Import routes
const authRoutes = require('./routes/auth');
const onboardingRoutes = require('./routes/onboarding');
const verifyEmailRoutes = require('./routes/verifyEmail');
const aiRoutes = require('./routes/ai');
const resourceRoutes = require('./routes/resources');
const mealRoutes = require('./routes/meals');
const recipeRoutes = require('./routes/recipes');
const dashboardRoutes = require('./routes/dashboard');
const workoutRoutes = require('./routes/workouts');
const healthTrackerRoutes = require('./routes/healthTracker');
const analyticsRoutes = require('./routes/analytics');
const deviceRoutes = require('./routes/devices');
const notificationRoutes = require('./routes/notifications');
const userRoutes = require('./routes/user');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin:
      process.env.FRONTEND_URL ||
      'https://vedafinalyearprojectmedifitai.netlify.app',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Medifit API is running...' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth/verify-email', verifyEmailRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/health-tracker', healthTrackerRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

// MongoDB Connection Function
const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error('❌ MONGO_URI is not defined in environment variables');
            console.error('Please create a .env file in the Backend directory with your MongoDB connection string.');
            process.exit(1);
        }

        // Check if MONGO_URI is still the placeholder
        if (process.env.MONGO_URI.includes('your_mongodb_connection_string_here')) {
            console.error('❌ MONGO_URI is not configured');
            console.error('Please update your .env file with your actual MongoDB connection string.');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        
        // Provide helpful error messages
        if (error.message.includes('authentication failed') || error.message.includes('bad auth')) {
            console.error('\n🔍 Troubleshooting steps:');
            console.error('1. Check your MongoDB username and password in the connection string');
            console.error('2. If your password has special characters, URL-encode them:');
            console.error('   - @ becomes %40');
            console.error('   - : becomes %3A');
            console.error('   - / becomes %2F');
            console.error('   - # becomes %23');
            console.error('   - ? becomes %3F');
            console.error('3. Verify your database user exists in MongoDB Atlas');
            console.error('4. Check that your IP address is whitelisted in MongoDB Atlas');
            console.error('   (Network Access → Add IP Address → Allow Access from Anywhere for development)');
            console.error('\n📝 Connection string format:');
            console.error('mongodb+srv://username:password@cluster.mongodb.net/database-name?retryWrites=true&w=majority');
        } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
            console.error('\n🔍 Network error - check your internet connection and MongoDB Atlas cluster status');
        }
        
        process.exit(1);
    }
};

// Connect & Start Server
(async () => {
    await connectDB();
    await seedAdmin();
    
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
})();
