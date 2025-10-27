// server/services/ApiService.js
const DigiFlazzService = require('./DigiFlazzService');
const MongoStorage = require('./MongoStorage');
const Operator = require('../models/Operator');

class ApiService {
    constructor() {
        this.digiFlazz = new DigiFlazzService();
        this.storage = new MongoStorage();
    }

    async getOperators() {
        try {
            console.log('🔄 Getting operators from database...');
            
            let operators = await Operator.find({ status: 'active' })
                .sort({ name: 1 })
                .lean();

            // Jika tidak ada operator, ambil dari DigiFlazz
            if (!operators || operators.length === 0) {
                console.log('🔄 No operators found, checking DigiFlazz...');
                operators = await this.getOperatorsFromDigiFlazz();
            }

            console.log(`✅ Found ${operators.length} operators`);
            
            return {
                success: true,
                data: operators
            };
            
        } catch (error) {
            console.error('❌ Error getting operators:', error);
            return {
                success: false,
                message: error.message,
                data: this.getDefaultOperators() // Fallback
            };
        }
    }

    async getOperatorsFromDigiFlazz() {
        try {
            const digiFlazzProducts = await this.digiFlazz.getPriceList();
            const operators = await this.convertDigiFlazzToOperators(digiFlazzProducts);
            
            // Simpan ke database
            if (operators.length > 0) {
                await this.saveOperatorsToDatabase(operators);
            }
            
            return operators;
        } catch (error) {
            console.error('❌ Error getting operators from DigiFlazz:', error);
            return this.getDefaultOperators();
        }
    }

    async saveOperatorsToDatabase(operators) {
        try {
            for (const operator of operators) {
                await Operator.findOneAndUpdate(
                    { code: operator.code },
                    operator,
                    { upsert: true, new: true }
                );
            }
            console.log(`✅ Saved ${operators.length} operators to database`);
        } catch (dbError) {
            console.error('❌ Error saving operators to database:', dbError);
        }
    }

    async convertDigiFlazzToOperators(digiFlazzProducts) {
        try {
            const operatorsMap = new Map();
            
            if (digiFlazzProducts && digiFlazzProducts.data) {
                digiFlazzProducts.data.forEach(product => {
                    if (product.category === 'pulsa' && product.brand) {
                        const operatorName = product.brand;
                        const operatorCode = operatorName.toLowerCase().replace(/\s+/g, '_');
                        
                        if (!operatorsMap.has(operatorCode)) {
                            operatorsMap.set(operatorCode, {
                                code: operatorCode,
                                name: operatorName,
                                type: 'pulsa',
                                category: this.mapOperatorCategory(operatorName),
                                status: 'active',
                                icon: this.getOperatorIcon(operatorName),
                                createdAt: new Date(),
                                updatedAt: new Date()
                            });
                        }
                    }
                });
            }

            return Array.from(operatorsMap.values());
            
        } catch (error) {
            console.error('❌ Error converting DigiFlazz to operators:', error);
            return this.getDefaultOperators();
        }
    }

    getOperatorIcon(operatorName) {
        const name = operatorName.toLowerCase();
        const icons = {
            telkomsel: '📱',
            indosat: '⚡',
            xl: '🔵',
            axis: '🟠',
            three: '🟢',
            smartfren: '🟣'
        };
        
        const category = this.mapOperatorCategory(operatorName);
        return icons[category] || '📱';
    }

    mapOperatorCategory(operatorName) {
        const name = operatorName.toLowerCase();
        
        if (name.includes('telkom') || name.includes('simpati') || name.includes('kartu as')) {
            return 'telkomsel';
        } else if (name.includes('indosat') || name.includes('im3') || name.includes('mentari')) {
            return 'indosat';
        } else if (name.includes('xl')) {
            return 'xl';
        } else if (name.includes('axis')) {
            return 'axis';
        } else if (name.includes('three') || name.includes('3')) {
            return 'three';
        } else if (name.includes('smartfren')) {
            return 'smartfren';
        } else {
            return 'other';
        }
    }

    getDefaultOperators() {
        return [
            { code: 'telkomsel', name: 'Telkomsel', type: 'pulsa', category: 'telkomsel', status: 'active', icon: '📱' },
            { code: 'indosat', name: 'Indosat', type: 'pulsa', category: 'indosat', status: 'active', icon: '⚡' },
            { code: 'xl', name: 'XL', type: 'pulsa', category: 'xl', status: 'active', icon: '🔵' },
            { code: 'axis', name: 'AXIS', type: 'pulsa', category: 'axis', status: 'active', icon: '🟠' },
            { code: 'three', name: '3 (Three)', type: 'pulsa', category: 'three', status: 'active', icon: '🟢' },
            { code: 'smartfren', name: 'Smartfren', type: 'pulsa', category: 'smartfren', status: 'active', icon: '🟣' }
        ];
    }

    async getProductsByOperator(operatorCode) {
        try {
            console.log(`🔄 Getting products for operator: ${operatorCode}`);
            
            const operator = await Operator.findOne({ 
                code: operatorCode,
                status: 'active'
            }).lean();

            if (!operator) {
                return {
                    success: false,
                    message: 'Operator not found',
                    data: []
                };
            }

            const products = await this.storage.getProductsByOperator(operator.category);
            
            return {
                success: true,
                data: products || []
            };
            
        } catch (error) {
            console.error(`❌ Error getting products for operator ${operatorCode}:`, error);
            return {
                success: false,
                message: error.message,
                data: []
            };
        }
    }
}

module.exports = ApiService;