const axios = require('axios');
const crypto = require('crypto');

class DigiflazzAPI {
    constructor() {
        this.username = process.env.DIGIFLAZZ_USERNAME;
        this.apiKey = process.env.DIGIFLAZZ_API_KEY;
        this.baseURL = 'https://api.digiflazz.com/v1';
        
        console.log('🔧 Digiflazz Config:', {
            username: this.username ? '✅ Set' : '❌ Missing',
            apiKey: this.apiKey ? '✅ Set' : '❌ Missing'
        });
    }

    generateSignature(cmd) {
        if (!this.username || !this.apiKey) {
            throw new Error('Digiflazz credentials not set');
        }
        return crypto.createHash('md5')
            .update(this.username + this.apiKey + cmd)
            .digest('hex');
    }

    async getPriceList() {
        try {
            if (!this.username || !this.apiKey) {
                return {
                    success: false,
                    error: 'Digiflazz credentials not set. Please set DIGIFLAZZ_USERNAME and DIGIFLAZZ_API_KEY'
                };
            }

            const signature = this.generateSignature('pricelist');
            
            console.log('🔄 Fetching price list from Digiflazz...');
            
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
