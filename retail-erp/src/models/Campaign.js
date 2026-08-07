const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Campaign = sequelize.define('Campaign', {
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
  type: {
    type: DataTypes.ENUM('email', 'sms', 'push', 'social', 'print', 'multi_channel'),
    defaultValue: 'email'
  },
  status: {
    type: DataTypes.ENUM('draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled'),
    defaultValue: 'draft'
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  targetAudience: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Targeting criteria for the campaign'
  },
  budget: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  actualCost: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  expectedRevenue: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  actualRevenue: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  metrics: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Campaign performance metrics'
  },
  templateId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false
  }
}, {
  tableName: 'campaigns',
  timestamps: true,
  indexes: [
    { fields: ['status'] },
    { fields: ['type'] },
    { fields: ['startDate'] },
    { fields: ['endDate'] }
  ]
});

module.exports = Campaign;
