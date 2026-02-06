const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log levels
const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

// Get current timestamp
const getTimestamp = () => {
  return new Date().toISOString();
};

// Format log message
const formatMessage = (level, message, meta = {}) => {
  return JSON.stringify({
    timestamp: getTimestamp(),
    level,
    message,
    ...meta
  });
};

// Write to log file
const writeToFile = (filename, message) => {
  const filePath = path.join(logsDir, filename);
  fs.appendFileSync(filePath, message + '\n');
};

// Logger functions
exports.error = (message, meta = {}) => {
  const formattedMessage = formatMessage(LOG_LEVELS.ERROR, message, meta);
  console.error(`❌ ${message}`, meta);
  writeToFile('error.log', formattedMessage);
};

exports.warn = (message, meta = {}) => {
  const formattedMessage = formatMessage(LOG_LEVELS.WARN, message, meta);
  console.warn(`⚠️  ${message}`, meta);
  writeToFile('combined.log', formattedMessage);
};

exports.info = (message, meta = {}) => {
  const formattedMessage = formatMessage(LOG_LEVELS.INFO, message, meta);
  console.log(`ℹ️  ${message}`, meta);
  writeToFile('combined.log', formattedMessage);
};

exports.debug = (message, meta = {}) => {
  if (process.env.NODE_ENV === 'development') {
    const formattedMessage = formatMessage(LOG_LEVELS.DEBUG, message, meta);
    console.log(`🔍 ${message}`, meta);
    writeToFile('debug.log', formattedMessage);
  }
};

// Log HTTP requests
exports.logRequest = (req, res, responseTime) => {
  const logData = {
    method: req.method,
    url: req.url,
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    ip: req.ip,
    userAgent: req.get('user-agent')
  };

  exports.info('HTTP Request', logData);
};

// Log database queries (for debugging)
exports.logQuery = (query, duration) => {
  if (process.env.NODE_ENV === 'development') {
    exports.debug('Database Query', {
      query: JSON.stringify(query),
      duration: `${duration}ms`
    });
  }
};

// Clean old logs (older than 30 days)
exports.cleanOldLogs = () => {
  const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

  fs.readdir(logsDir, (err, files) => {
    if (err) {
      exports.error('Error reading logs directory', { error: err.message });
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(logsDir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) return;

        const now = Date.now();
        const fileAge = now - stats.mtime.getTime();

        if (fileAge > maxAge) {
          fs.unlink(filePath, (err) => {
            if (err) {
              exports.error('Error deleting old log file', { file, error: err.message });
            } else {
              exports.info('Deleted old log file', { file });
            }
          });
        }
      });
    });
  });
};

module.exports = exports;
