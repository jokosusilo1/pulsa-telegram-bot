
// Simple API key authentication for admin routes
const authenticateAdmin = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid API key'
    });
  }
  
  next();
};

// Agent authentication based on Telegram ID
const authenticateAgent = (req, res, next) => {
  const telegramId = req.headers['x-telegram-id'];
  
  if (!telegramId) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Telegram ID required'
    });
  }
  
  req.agentTelegramId = telegramId;
  next();
};

module.exports = {
  authenticateAdmin,
  authenticateAgent
};
