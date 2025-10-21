// models/UniversalProduct.js
const DatabaseConfig = require('../config/database');

class UniversalProduct {
  constructor() {
    this.config = DatabaseConfig.getConfig();
  }
  
  async findActive() {
    if (this.config.type === 'sqlite') {
      return this.querySQLite("SELECT * FROM products WHERE status = 'active'");
    } else {
      return this.queryMongoDB({ status: 'active' });
    }
  }
  
  async findByCode(code) {
    if (this.config.type === 'sqlite') {
      return this.querySQLite("SELECT * FROM products WHERE code = ? AND status = 'active'", [code], true);
    } else {
      return this.queryMongoDB({ code: code, status: 'active' }, true);
    }
  }
  
  async createOrUpdate(productData) {
    if (this.config.type === 'sqlite') {
      return this.runSQLite(
        `INSERT OR REPLACE INTO products 
         (code, name, category, operator, base_price, selling_price, profit, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [productData.code, productData.name, productData.category, productData.operator,
         productData.base_price, productData.selling_price, productData.profit, productData.status]
      );
    } else {
      return this.runMongoDB(productData);
    }
  }
  
  // SQLite Methods
  querySQLite(sql, params = [], single = false) {
    return new Promise((resolve, reject) => {
      const sqlite3 = require('sqlite3').verbose();
      const db = new sqlite3.Database(this.config.path);
      
      const method = single ? 'get' : 'all';
      db[method](sql, params, (err, result) => {
        db.close();
        if (err) reject(err);
        else resolve(result);
      });
    });
  }
  
  runSQLite(sql, params = []) {
    return new Promise((resolve, reject) => {
      const sqlite3 = require('sqlite3').verbose();
      const db = new sqlite3.Database(this.config.path);
      
      db.run(sql, params, function(err) {
        db.close();
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });
  }
  
  // MongoDB Methods
  async queryMongoDB(query = {}, single = false) {
    const mongoose = await DatabaseConfig.connect();
    const Product = mongoose.model('Product', this.getMongoSchema());
    
    if (single) {
      return await Product.findOne(query);
    } else {
      return await Product.find(query);
    }
  }
  
  async runMongoDB(productData) {
    const mongoose = await DatabaseConfig.connect();
    const Product = mongoose.model('Product', this.getMongoSchema());
    
    return await Product.findOneAndUpdate(
      { code: productData.code },
      productData,
      { upsert: true, new: true }
    );
  }
  
  getMongoSchema() {
    const mongoose = require('mongoose');
    return new mongoose.Schema({
      code: { type: String, required: true, unique: true },
      name: { type: String, required: true },
      category: { type: String, required: true },
      operator: { type: String },
      base_price: { type: Number, required: true },
      selling_price: { type: Number, required: true },
      profit: { type: Number, required: true },
      status: { type: String, default: 'active' }
    }, { timestamps: true });
  }
}

module.exports = UniversalProduct;
