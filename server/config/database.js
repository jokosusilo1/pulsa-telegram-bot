const path = require('path');
const fs = require('fs');

class DatabaseConfig {
  static getConfig() {
    const env = process.env.NODE_ENV || 'development';
    
    console.log(`🎯 Database Config: ${env.toUpperCase()} mode`);
    
    // ⚠️ FORCE PAKAI JSON UNTUK DEVELOPMENT DI TERMUX
    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    return {
      type: 'json',
      path: path.join(dataDir, 'ppob.json'),
      name: 'JSON Storage (Development)'
    };
  }
  
  static getStorageType() {
    const config = this.getConfig();
    return config.type;
  }
  
  static getStorageConfig() {
    const config = this.getConfig();
    return config;
  }
}

module.exports = DatabaseConfig;