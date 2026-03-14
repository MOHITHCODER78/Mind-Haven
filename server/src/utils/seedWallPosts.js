const User = require('../models/User');
const WallPost = require('../models/WallPost');
const fallbackWallPosts = require('../data/fallbackWallPosts');

const seedWallPostsIfEmpty = async () => {
  let seedUser = await User.findOne({ email: 'seed-wall@mindhaven.app' });

  if (!seedUser) {
    seedUser = await User.create({
      name: 'Mind Haven Seed',
      email: 'seed-wall@mindhaven.app',
      role: 'admin',
      isVerified: true,
      password: 'seed-wall-password',
    });
  }

  let insertedCount = 0;

  for (const post of fallbackWallPosts) {
    const existingPost = await WallPost.findOne({
      user: seedUser._id,
      content: post.content,
      tag: post.tag,
    });

    if (existingPost) {
      continue;
    }

    await WallPost.create({
      user: seedUser._id,
      content: post.content,
      tag: post.tag,
      status: 'published',
      reactions: post.reactions,
      reportCount: 0,
      moderationReason: '',
    });

    insertedCount += 1;
  }

  if (insertedCount > 0) {
    console.log(`Default feelings wall posts seeded: ${insertedCount}`);
  }
};

module.exports = seedWallPostsIfEmpty;
