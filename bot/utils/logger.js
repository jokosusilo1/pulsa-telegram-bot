const { NODE_ENV } = require('../config/constants');

const logger = {
  info: (message) => {
    console.log(`[INFO] ${new Date().toISOString()}: ${message}`);
  },
  
  error: (message, error = null) => {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`);
    if (error && NODE_ENV === 'development') {
      console.error(error);
    }
  },
  
  warn: (message) => {
    console.warn(`[WARN] ${new Date().toISOString()}: ${message}`);
  }
};

module.exports = logger;
