const mongoose = require('mongoose');
const seedAdminIfMissing = require('../utils/seedAdmin');
const seedSupportUsers = require('../utils/seedSupportUsers');
const seedResourcesIfEmpty = require('../utils/seedResources');
const seedWallPostsIfEmpty = require('../utils/seedWallPosts');

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.warn('MONGODB_URI is not set. Starting API without a database connection.');
    return;
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected');
    await seedAdminIfMissing();
    await seedSupportUsers();
    await seedResourcesIfEmpty();
    await seedWallPostsIfEmpty();
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
  }
};

module.exports = connectDB;
