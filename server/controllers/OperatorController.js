// server/controllers/OperatorController.js
const Operator = require('../models/Operator');

class OperatorController {
  // ⭐⭐⭐ GET ALL OPERATORS ⭐⭐⭐
  async getOperators(req, res) {
    try {
      const { type, status = 'active' } = req.query;
      
      // Build filter
      const filter = { status };
      if (type) {
        filter.type = type;
      }

      const operators = await Operator.find(filter)
        .sort({ name: 1 })
        .select('-__v')
        .lean();

      console.log(`✅ Found ${operators.length} operators`);

      res.json({
        success: true,
        data: operators,
        count: operators.length
      });

    } catch (error) {
      console.error('❌ Error getting operators:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch operators',
        error: error.message
      });
    }
  }

  // ⭐⭐⭐ GET OPERATOR BY CODE ⭐⭐⭐
  async getOperatorByCode(req, res) {
    try {
      const { code } = req.params;
      
      const operator = await Operator.findOne({ 
        code: code.toLowerCase(),
        status: 'active'
      }).select('-__v').lean();

      if (!operator) {
        return res.status(404).json({
          success: false,
          message: 'Operator not found'
        });
      }

      res.json({
        success: true,
        data: operator
      });

    } catch (error) {
      console.error('❌ Error getting operator:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch operator',
        error: error.message
      });
    }
  }

  // ⭐⭐⭐ CREATE OPERATOR ⭐⭐⭐
  async createOperator(req, res) {
    try {
      const operatorData = req.body;
      
      // Check if operator already exists
      const existingOperator = await Operator.findOne({ 
        code: operatorData.code.toLowerCase() 
      });

      if (existingOperator) {
        return res.status(400).json({
          success: false,
          message: 'Operator with this code already exists'
        });
      }

      const operator = new Operator(operatorData);
      await operator.save();

      console.log(`✅ Created operator: ${operator.name}`);

      res.status(201).json({
        success: true,
        message: 'Operator created successfully',
        data: operator
      });

    } catch (error) {
      console.error('❌ Error creating operator:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create operator',
        error: error.message
      });
    }
  }

  // ⭐⭐⭐ UPDATE OPERATOR ⭐⭐⭐
  async updateOperator(req, res) {
    try {
      const { code } = req.params;
      const updateData = req.body;

      const operator = await Operator.findOneAndUpdate(
        { code: code.toLowerCase() },
        updateData,
        { new: true, runValidators: true }
      ).select('-__v');

      if (!operator) {
        return res.status(404).json({
          success: false,
          message: 'Operator not found'
        });
      }

      console.log(`✅ Updated operator: ${operator.name}`);

      res.json({
        success: true,
        message: 'Operator updated successfully',
        data: operator
      });

    } catch (error) {
      console.error('❌ Error updating operator:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update operator',
        error: error.message
      });
    }
  }

  // ⭐⭐⭐ SEED DEFAULT OPERATORS ⭐⭐⭐
  async seedOperators(req, res) {
    try {
      const defaultOperators = [
        // Pulsa Operators
        { code: 'telkomsel', name: 'Telkomsel', type: 'pulsa', category: 'telkomsel', icon: '📱' },
        { code: 'indosat', name: 'Indosat', type: 'pulsa', category: 'indosat', icon: '📱' },
        { code: 'xl', name: 'XL', type: 'pulsa', category: 'xl', icon: '📱' },
        { code: 'axis', name: 'AXIS', type: 'pulsa', category: 'axis', icon: '📱' },
        { code: 'three', name: '3 (Three)', type: 'pulsa', category: 'three', icon: '📱' },
        { code: 'smartfren', name: 'Smartfren', type: 'pulsa', category: 'smartfren', icon: '📱' },

        // Data Operators (same as pulsa)
        { code: 'telkomsel_data', name: 'Telkomsel', type: 'data', category: 'telkomsel', icon: '📶' },
        { code: 'indosat_data', name: 'Indosat', type: 'data', category: 'indosat', icon: '📶' },
        { code: 'xl_data', name: 'XL', type: 'data', category: 'xl', icon: '📶' },
        { code: 'axis_data', name: 'AXIS', type: 'data', category: 'axis', icon: '📶' },
        { code: 'three_data', name: '3 (Three)', type: 'data', category: 'three', icon: '📶' },
        { code: 'smartfren_data', name: 'Smartfren', type: 'data', category: 'smartfren', icon: '📶' },

        // Other Categories
        { code: 'pln', name: 'PLN', type: 'pln', category: 'other', icon: '⚡' },
        { code: 'game', name: 'Game Voucher', type: 'game', category: 'other', icon: '🎮' }
      ];

      // Insert operators
      const result = await Operator.insertMany(defaultOperators, { ordered: false });
      
      console.log(`✅ Seeded ${result.length} operators`);

      res.json({
        success: true,
        message: 'Operators seeded successfully',
        data: {
          inserted: result.length,
          operators: result
        }
      });

    } catch (error) {
      // Ignore duplicate key errors
      if (error.code === 11000) {
        console.log('ℹ️ Some operators already exist, skipping duplicates');
        return res.json({
          success: true,
          message: 'Operators already seeded'
        });
      }

      console.error('❌ Error seeding operators:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to seed operators',
        error: error.message
      });
    }
  }
}

module.exports = new OperatorController();

