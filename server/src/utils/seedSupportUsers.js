const User = require('../models/User');

const DEFAULT_SUPPORT_PASSWORD = process.env.DEFAULT_SUPPORT_PASSWORD || 'Support@123456';

const supportUsers = [
  {
    name: 'Dr. Aisha Menon',
    email: 'care@mindhaven.app',
    role: 'counsellor',
    password: DEFAULT_SUPPORT_PASSWORD,
  },
  {
    name: 'Rohan Kumar',
    email: 'mentor@mindhaven.app',
    role: 'peer_mentor',
    password: DEFAULT_SUPPORT_PASSWORD,
  },
];

const seedSupportUsers = async () => {
  const supportPassword = process.env.DEFAULT_SUPPORT_PASSWORD || 'Support@123456';

  for (const seedUser of supportUsers) {
    let user = await User.findOne({ email: seedUser.email });

    if (!user) {
      user = new User({
        ...seedUser,
        password: supportPassword,
        isVerified: true
      });
      await user.save();
      console.log(`Support account created: ${seedUser.email}`);
    } else {
      const isMatch = await user.matchPassword(supportPassword);
      if (!isMatch || user.role !== seedUser.role) {
        user.password = supportPassword;
        user.role = seedUser.role;
        user.isVerified = true;
        user.markModified('password');
        await user.save();
        console.log(`Support account updated: ${seedUser.email}`);
      } else {
        console.log(`Support account ready: ${seedUser.email}`);
      }
    }
  }
};

module.exports = seedSupportUsers;
