const axios = require('axios');

class Digiflazz {
    constructor() {
        this.username = process.env.DIGIFLAZZ_USERNAME;
        this.apiKey = process.env.DIGIFLAZZ_API_KEY;
        this.baseUrl = 'https://api.digiflazz.com/v1';
    }

    async makeRequest(endpoint, data) {
        const requestData = {
            ...data,
            username: this.username,
            key: this.apiKey
        };

        console.log(`🔧 Digiflazz Request to ${endpoint}:`, { 
            ...requestData, 
            key: '***' 
        });

        try {
            // ✅ FIX: Perbaiki string template - hapus karakter yang salah
            const response = await axios.post(`${this.baseUrl}${endpoint}`, requestData, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 30000
            });

            console.log(`✅ Digiflazz Raw Response:`, JSON.stringify(response.data, null, 2));

            return response.data;

        } catch (error) {
            console.error('❌ Digiflazz API Error:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });

            return {
                success: false,
                error: error.response?.data || error.message
            };
        }
    }

    async getPriceList() {
        try {
            const data = {
                cmd: "prepaid"
            };
            const result = await this.makeRequest('/price-list', data);
            
            // Normalize response structure
            if (result && typeof result === 'object') {
                return {
                    success: true,
                    data: result.data || result
                };
            }
            
            return result;
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async checkBalance() {
        const data = {
            cmd: "deposit"
        };
        return await this.makeRequest('/cek-saldo', data);
    }

    async purchase(sku, customerNo, refId = null) {
        const data = {
            buyer_sku_code: sku,
            customer_no: customerNo,
            ref_id: refId || `RF${Date.now()}${Math.random().toString(36).substr(2, 5)}`
        };
        return await this.makeRequest('/transaction', data);
    }
}

module.exports = new Digiflazz();
