const User = require('../models/User');

const seedAdmin = async () => {
  try {
    // 1) Any user already has admin role?
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      console.log('✅ Admin user already exists:', adminExists.email);
      return;
    }

    // 2) Admin email exists but without admin role (e.g. schema updated after creation)
    const userByEmail = await User.findOne({ email: 'admin@medifit.ai' });
    if (userByEmail) {
      userByEmail.role = 'admin';
      await userByEmail.save();
      console.log('🎉 Existing user promoted to admin:', userByEmail.email);
      console.log('   Password: Admin@1234  (or whatever you previously set)');
      return;
    }

    // 3) Create fresh admin user
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
