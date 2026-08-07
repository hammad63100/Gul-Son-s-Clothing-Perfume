const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  variantId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  sku: {
    type: DataTypes.STRING,
    allowNull: false
  },
  productName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  variantName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1
    }
  },
  unitPrice: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  discountAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  taxAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  totalPrice: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  fulfillmentStatus: {
    type: DataTypes.ENUM('pending', 'partial', 'fulfilled', 'cancelled'),
    defaultValue: 'pending'
  },
  warehouseId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true
  }
}, {
  tableName: 'order_items',
  timestamps: true,
  indexes: [
    { fields: ['orderId'] },
    { fields: ['productId'] },
    { fields: ['variantId'] }
  ]
});

module.exports = OrderItem;
