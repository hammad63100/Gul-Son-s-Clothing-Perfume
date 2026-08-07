const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  type: {
    type: DataTypes.ENUM(
      'sales',
      'inventory',
      'customer',
      'financial',
      'pos',
      'purchase',
      'marketing',
      'custom'
    ),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  config: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Report configuration and filters'
  },
  columns: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Column definitions'
  },
  isScheduled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  scheduleConfig: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Cron expression and delivery settings'
  },
  lastRunAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  lastRunBy: {
    type: DataTypes.UUID,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isSystem: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'reports',
  timestamps: true,
  indexes: [
    { fields: ['code'] },
    { fields: ['type'] }
  ]
});

module.exports = Report;
