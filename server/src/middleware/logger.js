const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '..', 'logs');
const logFile = path.join(logDir, 'app.log');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logStructured = (level, message, meta = {}) => {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  };

  const line = JSON.stringify(entry);

  if (level === 'error') {
    console.error(line);
  } else if (level === 'warn') {
    console.warn(line);
  } else {
    console.log(line);
  }

  fs.appendFile(logFile, line + '\n', (err) => {
    if (err) {
      console.error('Failed to write log:', err.message);
    }
  });
};

const logger = {
  info: (message, meta) => logStructured('info', message, meta),
  warn: (message, meta) => logStructured('warn', message, meta),
  error: (message, meta) => logStructured('error', message, meta),
};

module.exports = logger;