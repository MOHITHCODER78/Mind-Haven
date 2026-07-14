const express = require('express');

const router = express.Router();

router.get('/privacy-policy', (_req, res) => {
  res.json({
    title: 'Privacy Policy',
    content: 'Mind Haven is designed to be a private, supportive space for students. We collect account information, mood check-ins, support chat messages, anonymous wall posts, and basic usage metadata. We do not sell personal data. Data is used to provide core features and improve safety. We share data only when required by law or to protect safety. Security measures include password hashing, token authentication, HTTPS, rate limiting, and moderation. You can update profile details, request account deletion, or contact support for privacy concerns.',
  });
});

router.get('/terms', (_req, res) => {
  res.json({
    title: 'Terms of Use',
    content: 'By accessing Mind Haven, you agree to these terms. Mind Haven is not emergency care or a replacement for licensed mental health care. Be respectful, honest, and safe. Keep login credentials secure. Content is moderated for safety. The platform is provided as-is and is not liable for decisions based on content. Use as a supplement to professional care.',
  });
});

module.exports = router;