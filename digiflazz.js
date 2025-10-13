const axios = require('axios');

class Digiflazz {
    constructor() {
        this.username = process.env.DIGIFLAZZ_USERNAME;
        this.apiKey = process.env.DIGIFLAZZ_API_KEY;
        this.baseUrl = 'https://api.digiflazz.com/v1';
        
        console.log("🔧 Digiflazz Config Check:");
        console.log("- Username:", this.username ? "✅ SET" : "❌ MISSING");
        console.log("- API Key:", this.apiKey ? "✅ SET" : "❌ MISSING");
    }

    async makeRequest(endpoint, data) {
        // Validasi credentials
        if (!this.username || !this.apiKey) {
            const errorMsg = "❌ Digiflazz credentials not set in environment variables";
            console.log(errorMsg);
            return {
                success: false,
                error: errorMsg
            };
        }

        const requestData = {
            ...data,
            username: this.username,
            key: this.apiKey
        };

        console.log(`🔧 Digiflazz API Request to: ${endpoint}`);
        console.log(`🔧 Request Data:`, { 
            ...requestData, 
            key: '***' 
        });

        try {
            const response = await axios.post(`${this.baseUrl}${endpoint}`, requestData, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 15000
            });

            console.log(`✅ Digiflazz API Response Success:`, {
                endpoint: endpoint,
                status: response.status
            });

            // Log struktur data untuk debug
            if (endpoint === '/price-list' && response.data && response.data.data) {
                console.log(`📊 Price List Data Summary:`, {
                    hasData: !!response.data.data,
                    dataType: typeof response.data.data,
                    isArray: Array.isArray(response.data.data),
                    arrayLength: Array.isArray(response.data.data) ? response.data.data.length : 'N/A'
                });
                
                if (Array.isArray(response.data.data) && response.data.data.length > 0) {
                    const sample = response.data.data[0];
                    console.log(`🔍 Sample Product Structure:`, {
                        product_name: sample.product_name,
                        category: sample.category,
                        brand: sample.brand,
                        price: sample.price,
                        buyer_product_status: sample.buyer_product_status,
                        buyer_sku_code: sample.buyer_sku_code
                    });
                }
            }

            return response.data;

        } catch (error) {
            console.error(`❌ Digiflazz API Error:`, {
                endpoint: endpoint,
                status: error.response?.status,
                statusText: error.response?.statusText,
                error: error.response?.data || error.message
            });

            // Handle specific error cases
            if (error.response?.status === 401) {
                return {
                    success: false,
                    error: "Authentication failed - periksa username dan API key"
                };
            } else if (error.response?.status === 403) {
                return {
                    success: false,
                    error: "IP tidak terwhitelist atau akses ditolak"
                };
            } else if (error.code === 'ECONNREFUSED') {
                return {
                    success: false,
                    error: "Tidak bisa terhubung ke server Digiflazz"
                };
            }

            return {
                success: false,
                error: error.response?.data || error.message
            };
        }
    }

    async getPriceList() {
        console.log("🔄 [DIGIFLAZZ] Getting price list...");
        
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
        
        return result || {
            success: false,
            error: "No response from Digiflazz"
        };
    }

    async checkBalance() {
        console.log("🔄 [DIGIFLAZZ] Checking balance...");
        
        const data = { 
            cmd: "deposit" 
        };
        
        const result = await this.makeRequest('/cek-saldo', data);
        
        if (result && result.data) {
            return {
                success: true,
                balance: result.data
            };
        } else {
            return result || {
                success: false,
                error: "Gagal mendapatkan response saldo"
            };
        }
    }

    async purchase(sku, customerNo, refId = null) {
        console.log("🔄 [DIGIFLAZZ] Processing purchase...");
        
        const data = {
            buyer_sku_code: sku,
            customer_no: customerNo,
            ref_id: refId || `RF${Date.now()}${Math.random().toString(36).substr(2, 5)}`
        };
        
        const result = await this.makeRequest('/transaction', data);
        
        if (result && result.data) {
            return {
                success: true,
                data: result.data,
                refId: data.ref_id
            };
        } else {
            return result || {
                success: false,
                error: "Gagal memproses transaksi"
            };
        }
    }
}

module.exports = new Digiflazz();
