const jwt = require('jsonwebtoken');

const generateToken = (payload) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required.');
  }

  return jwt.sign(payload, secret, {
    expiresIn: '7d',
  });
};

module.exports = generateToken;
