const crypto = require('crypto');

// Middleware authentication
const simpleAuth = (req, res, next) => {
    // Skip auth untuk public routes
    const publicRoutes = ['/health', '/api/version', '/'];
    if (publicRoutes.includes(req.path)) {
        return next();
    }

    // Get API Key dari header atau query parameter
    const apiKey = 
        req.headers['x-api-key'] ||
        req.headers['authorization']?.replace('Bearer ', '') ||
        req.query.api_key;

    // Valid API keys (akan di-set di environment variables)
    const validKeys = [
        process.env.API_KEY_DASHBOARD,
        process.env.API_KEY_BOT,
        process.env.API_KEY_ADMIN
    ].filter(Boolean);

    // Check jika API key tidak ada
    if (!apiKey) {
        return res.status(401).json({
            success: false,
            message: 'API key is required',
            code: 'MISSING_API_KEY',
            documentation: 'Include x-api-key header or api_key query parameter'
        });
    }

    // Check jika API key valid
    if (!validKeys.includes(apiKey)) {
        return res.status(401).json({
            success: false,
            message: 'Invalid API key',
            code: 'INVALID_API_KEY'
        });
    }

    // Auth success
    console.log(`✅ API Key validated: ${apiKey.substring(0, 10)}...`);
    next();
};

module.exports = { simpleAuth };
