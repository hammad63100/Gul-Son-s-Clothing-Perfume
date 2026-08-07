const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Promotion = sequelize.define('Promotion', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  code: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  type: {
    type: DataTypes.ENUM(
      'percentage',
      'fixed_amount',
      'buy_x_get_y',
      'free_shipping',
      'bundle',
      'loyalty_points'
    ),
    defaultValue: 'percentage'
  },
  discountValue: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    comment: 'Percentage or fixed amount depending on type'
  },
  minPurchaseAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  maxDiscountAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  usageLimit: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  usageCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  perCustomerLimit: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  applicableProducts: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Array of product IDs or categories'
  },
  applicableCustomerSegments: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Array of customer segment IDs'
  },
  applicableChannels: {
    type: DataTypes.JSONB,
    defaultValue: ['online', 'pos'],
    comment: 'Where promotion can be used'
  },
  autoApply: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  stackable: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'promotions',
  timestamps: true,
  indexes: [
    { fields: ['code'] },
    { fields: ['type'] },
    { fields: ['isActive'] },
    { fields: ['startDate'] },
    { fields: ['endDate'] }
  ]
});

module.exports = Promotion;
