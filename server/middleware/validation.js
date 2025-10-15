
const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Product validation rules
const validateProduct = [
  body('name')
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2-100 characters'),
  body('category')
    .isIn(['pulsa', 'paket-data', 'ewallet', 'pln', 'game-voucher', 'custom'])
    .withMessage('Invalid category'),
  body('basePrice')
    .isFloat({ min: 0 })
    .withMessage('Base price must be a positive number'),
  body('markup')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Markup must be a positive number'),
  handleValidationErrors
];

// Transaction validation rules
const validateTransaction = [
  body('productId')
    .isMongoId()
    .withMessage('Valid product ID is required'),
  body('customerNo')
    .notEmpty()
    .withMessage('Customer number is required')
    .matches(/^08[1-9][0-9]{7,10}$/)
    .withMessage('Invalid phone number format'),
  handleValidationErrors
];

module.exports = {
  validateProduct,
  validateTransaction,
  handleValidationErrors
};
