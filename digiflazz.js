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
            const response = await axios.post(`${this.baseURL}/price-list`, {
                cmd: "prepaid",
                username: this.username,
                sign: signature
            }, {
                timeout: 10000
            });

            console.log('✅ Price list fetched successfully');
            return {
                success: true,
                data: response.data.data
            };
        } catch (error) {
            console.error('❌ Digiflazz Price Error:', error.message);
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    async checkBalance() {
        try {
            if (!this.username || !this.apiKey) {
                return {
                    success: false,
                    error: 'Digiflazz credentials not set'
                };
            }

            const signature = this.generateSignature('depo');
            
            const response = await axios.post(`${this.baseURL}/cek-saldo`, {
                username: this.username,
                sign: signature
            }, {
                timeout: 10000
            });

            return {
                success: true,
                balance: response.data.data
            };
        } catch (error) {
            console.error('❌ Digiflazz Balance Error:', error.message);
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    async purchase(productCode, phoneNumber, refId = null) {
        try {
            if (!this.username || !this.apiKey) {
                return {
                    success: false,
                    error: 'Digiflazz credentials not set'
                };
            }

            const signature = this.generateSignature('depo');
            const referenceId = refId || 'REF' + Date.now();
            
            console.log(`🔄 Processing purchase: ${productCode} for ${phoneNumber}`);
            
            const response = await axios.post(`${this.baseURL}/transaction`, {
                username: this.username,
                buyer_sku_code: productCode,
                customer_no: phoneNumber,
                ref_id: referenceId,
                testing: false, // Set true untuk testing mode
                sign: signature
            }, {
                timeout: 15000
            });

            console.log('✅ Purchase response:', response.data);
            return {
                success: true,
                data: response.data.data,
                refId: referenceId
            };
        } catch (error) {
            console.error('❌ Digiflazz Purchase Error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data || error.message
            };
        }
    }

    // Cek status transaksi
    async checkStatus(refId) {
        try {
            const signature = this.generateSignature('depo');
            
            const response = await axios.post(`${this.baseURL}/transaction`, {
                username: this.username,
                ref_id: refId,
                sign: signature,
                commands: 'status'
            });

            return {
                success: true,
                data: response.data.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = new DigiflazzAPI();
