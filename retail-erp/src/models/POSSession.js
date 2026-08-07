const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const POSession = sequelize.define('POSSession', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
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
  status: {
    type: DataTypes.ENUM('open', 'active', 'closed', 'suspended'),
    defaultValue: 'open'
  },
  openedAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  closedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  startingCash: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  expectedCash: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  actualCash: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  cashDiscrepancy: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  cardTotal: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  otherPaymentTotal: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  totalSales: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  totalRefunds: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  totalDiscounts: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  transactionCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  closedBy: {
    type: DataTypes.UUID,
    allowNull: true
  }
}, {
  tableName: 'pos_sessions',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['warehouseId'] },
    { fields: ['status'] }
  ]
});

module.exports = POSession;
