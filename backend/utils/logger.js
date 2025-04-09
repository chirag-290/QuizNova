const fs = require('fs');
const path = require('path');

/**
 *  
 * @param {String} type - Log type (info, warn, error)
 * @param {String} message - Log message
 * @param {Object} data - Additional data to log
 */
exports.logToFile = (type, message, data = {}) => {
  const dir = path.join(__dirname, '../logs');
  
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString();
  const logFile = path.join(dir, `${new Date().toISOString().split('T')[0]}.log`);
  
  const logData = {
    timestamp,
    type,
    message,
    ...data
  };
 
  fs.appendFile(
    logFile, 
    `${JSON.stringify(logData)}\n`, 
    (err) => {
      if (err) {
        console.error('Error writing to log file:', err);
      }
    }
  );
  
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${type.toUpperCase()}] ${message}`, data);
  }
};
 
exports.info = (message, data) => this.logToFile('info', message, data);
exports.warn = (message, data) => this.logToFile('warn', message, data);
exports.error = (message, data) => this.logToFile('error', message, data);