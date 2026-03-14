const User = require('../models/User');

const DEFAULT_ADMIN_EMAIL = 'admin@mindhaven.app';
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123456';

const seedAdminIfMissing = async () => {
  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@mindhaven.app';
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123456';

  let adminUser = await User.findOne({ email: adminEmail });

  if (!adminUser) {
    adminUser = new User({
      name: 'Mind Haven Admin',
      email: adminEmail,
      role: 'admin',
      isVerified: true,
      password: adminPassword,
    });
    await adminUser.save();
    console.log(`Admin account created: ${adminEmail}`);
  } else {
    const isMatch = await adminUser.matchPassword(adminPassword);
    if (!isMatch) {
      adminUser.password = adminPassword;
      adminUser.markModified('password');
      await adminUser.save();
      console.log(`Admin password updated for: ${adminEmail}`);
    } else {
      console.log(`Admin account ready: ${adminEmail}`);
    }
  }
};

module.exports = seedAdminIfMissing;
