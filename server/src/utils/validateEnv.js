const requiredEnvVars = [
  'JWT_SECRET',
  'MONGODB_URI',
];

const optionalButRecommended = [
  'SMTP_HOST',
  'SMTP_USER',
  'SMTP_PASS',
  'GEMINI_API_KEY',
];

const validateEnv = () => {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length) {
    console.error(`[ENV] Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  const weakJwt = process.env.JWT_SECRET === 'change-me-in-production' || process.env.JWT_SECRET.length < 32;
  if (weakJwt) {
    console.warn('[ENV] JWT_SECRET looks weak. Use a long random string in production.');
  }

  const recommended = optionalButRecommended.filter((key) => !process.env[key]);
  if (recommended.length) {
    console.warn(`[ENV] Missing recommended environment variables: ${recommended.join(', ')}`);
  }

  console.log('[ENV] Environment validation passed.');
};

module.exports = validateEnv;