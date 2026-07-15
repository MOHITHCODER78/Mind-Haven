const xss = require('xss');

/**
 * Sanitize user input to prevent XSS attacks
 * @param {string} input - The raw user input
 * @returns {string} - Sanitized input with HTML stripped
 */
const sanitizeUserInput = (input) => {
  if (typeof input !== 'string') {
    return input;
  }

  return xss(input, {
    whiteList: {}, // No HTML tags allowed
    stripIgnoredTag: true,
    stripLeadingAndTrailingWhitespace: true,
  });
};

module.exports = { sanitizeUserInput };