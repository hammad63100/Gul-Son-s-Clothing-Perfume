const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LoyaltyTransaction = sequelize.define('LoyaltyTransaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  customerId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  programId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('earn', 'redeem', 'expire', 'adjustment', 'refund'),
    allowNull: false
  },
  points: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Positive for earn, negative for redeem'
  },
  balanceAfter: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  promotionId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true
  }
}, {
  tableName: 'loyalty_transactions',
  timestamps: true,
  indexes: [
    { fields: ['customerId'] },
    { fields: ['programId'] },
    { fields: ['orderId'] },
    { fields: ['type'] }
  ]
});

module.exports = LoyaltyTransaction;
