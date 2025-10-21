const ProductSyncService = require('./ProductSyncService');
const StorageService = require('./StorageService');

class OrderService {
    async processOrder(agentId, productCode, customerPhone, refId = null) {
        try {
            // 1. Cek produk di storage kita
            const product = await StorageService.findActiveProduct(productCode);
            if (!product) {
                throw new Error('Product not found or inactive');
            }
            
            // 2. Cek agent
            const agent = await StorageService.getAgent(agentId);
            if (!agent) {
                throw new Error('Agent not found');
            }
            
            // 3. Cek saldo agent
            if (agent.balance < product.price) {
                throw new Error('Insufficient balance');
            }
            
            // 4. Generate refId jika tidak ada
            const transactionRefId = refId || `REF${Date.now()}${Math.random().toString(36).substr(2, 5)}`;
            
            // 5. Process order ke DigiFlazz
            const digiflazzResult = await ProductSyncService.purchaseProduct(
                productCode, 
                customerPhone, 
                transactionRefId
            );
            
            if (!digiflazzResult.success) {
                throw new Error(`DigiFlazz error: ${digiflazzResult.error}`);
            }
            
            // 6. Kurangi saldo agent
            await StorageService.updateAgentBalance(agentId, -product.price);
            
            // 7. Catat transaksi
            const transaction = await StorageService.saveTransaction({
                agentId,
                customerPhone,
                productCode: product.code,
                productName: product.name,
                amount: product.price,
                commission: product.commission,
                refId: transactionRefId,
                digiflazzResponse: digiflazzResult.data,
                status: 'success'
            });
            
            return {
                success: true,
                transaction,
                message: 'Order processed successfully'
            };
            
        } catch (error) {
            console.error('Order processing failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = new OrderService();
