let isPolling = false;
let pollingErrorCount = 0;
const MAX_ERROR_COUNT = 10;

class PollingManager {
    static startPolling(bot) {
        if (isPolling) {
            console.log('⚠️ Polling already running');
            return;
        }

        console.log('🔄 Starting bot polling...');
        
        bot.startPolling().then(() => {
            isPolling = true;
            pollingErrorCount = 0;
            console.log('✅ Bot polling started successfully');
        }).catch(error => {
            console.log('❌ Failed to start polling:', error.message);
            this.retryPolling(bot);
        });

        // Enhanced error handling
        bot.on('polling_error', (error) => {
            this.handlePollingError(error);
        });
    }

    static stopPolling() {
        if (isPolling) {
            console.log('🛑 Stopping bot polling...');
            bot.stopPolling();
            isPolling = false;
        }
    }

    static handlePollingError(error) {
        pollingErrorCount++;

        if (error.message.includes('409 Conflict')) {
            if (pollingErrorCount % 10 === 0) {
                console.log('⚠️ Polling conflict detected (normal in cloud environment)');
            }
        } else {
            console.log('❌ Polling Error:', error.message);
        }

        if (pollingErrorCount >= MAX_ERROR_COUNT) {
            console.log(`🔄 Too many errors (${pollingErrorCount}), consider restarting...`);
        }
    }

    static retryPolling(bot) {
        setTimeout(() => {
            this.startPolling(bot);
        }, 10000);
    }

    static getStatus() {
        return {
            isPolling,
            errorCount: pollingErrorCount
        };
    }
}

module.exports = PollingManager;
