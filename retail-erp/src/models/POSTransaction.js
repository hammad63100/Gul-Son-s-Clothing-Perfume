const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const POSTransaction = sequelize.define('POSTransaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  sessionId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  transactionNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  customerId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  customerName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('sale', 'refund', 'exchange', 'void'),
    defaultValue: 'sale'
  },
  status: {
    type: DataTypes.ENUM('completed', 'pending', 'cancelled', 'refunded'),
    defaultValue: 'completed'
  },
  subtotal: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  taxAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  discountAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  totalAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  payments: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Array of payment objects: [{method, amount, reference}]'
  },
  items: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Array of item details for quick reference'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  processedBy: {
    type: DataTypes.UUID,
    allowNull: false
  },
  warehouseId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  registerId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  receiptData: {
    type: DataTypes.JSONB,
    allowNull: true
  }
}, {
  tableName: 'pos_transactions',
  timestamps: true,
  indexes: [
    { fields: ['sessionId'] },
    { fields: ['transactionNumber'] },
    { fields: ['customerId'] },
    { fields: ['type'] },
    { fields: ['createdAt'] }
  ]
});

module.exports = POSTransaction;
