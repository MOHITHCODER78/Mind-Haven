const crypto = require('crypto');
const RefreshToken = require('../models/RefreshToken');

const generateRefreshToken = async (userId) => {
  const token = crypto.randomBytes(64).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await RefreshToken.create({
    token,
    user: userId,
    expiresAt,
  });

  return token;
};

module.exports = generateRefreshToken;