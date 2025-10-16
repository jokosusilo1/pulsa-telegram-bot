const express = require('express');
const PollingManager = require('../utils/pollingManager');

class Server {
    static initializeServer(bot) {
        const app = express();
        const PORT = process.env.PORT || 3000;

        app.use(express.json());

        // Health check endpoint
        app.get('/', (req, res) => {
            const status = PollingManager.getStatus();
            res.json({ 
                status: 'OK', 
                message: 'Pulsa Telegram Bot is running!',
                polling: status.isPolling,
                pollingErrors: status.errorCount,
                timestamp: new Date().toISOString()
            });
        });

        app.get('/health', (req, res) => {
            res.status(200).json({ 
                status: 'healthy',
                polling: PollingManager.getStatus().isPolling,
                uptime: process.uptime(),
                memory: process.memoryUsage()
            });
        });

        // Start server
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`✅ Server is running on port ${PORT}`);
            console.log(`🌐 Health check: http://0.0.0.0:${PORT}/health`);
        });

        return app;
    }
}

module.exports = Server;
