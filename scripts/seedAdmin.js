const User = require('../models/User');

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });

    if (adminExists) {
      console.log('✅ Admin user already exists:', adminExists.email);
      return;
    }

    const admin = new User({
      fullName: 'System Admin',
      email: 'admin@medifit.ai',
      phone: '+250000000000',
      password: 'Admin@1234',
      isEmailVerified: true,
      onboardingCompleted: true,
      role: 'admin',
      onboardingData: {
        age: 30,
        gender: 'other',
        height: 170,
        weight: 70,
        activityLevel: 'moderate',
        goal: 'maintain',
      },
    });

    await admin.save();

    console.log('🎉 Default admin user created successfully!');
    console.log('   Email: admin@medifit.ai');
    console.log('   Password: Admin@1234');
    console.log('   ⚠️  Please change this password after first login.');
  } catch (error) {
    console.error('❌ Error seeding admin user:', error.message);
  }
};

module.exports = seedAdmin;
