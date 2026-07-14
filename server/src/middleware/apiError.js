const logger = require('./logger');

const standardizeError = (err, _req, _res, next) => {
  const statusCode = _res.statusCode && _res.statusCode !== 200 ? _res.statusCode : 500;

  if (!_res.headersSent) {
    logger.error('API error', {
      statusCode,
      message: err.message,
      stack: err.stack,
    });

    _res.status(statusCode).json({
      message: err.message || 'Server error',
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
  } else {
    next(err);
  }
};

module.exports = standardizeError;