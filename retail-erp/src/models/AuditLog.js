const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false
  },
  entityType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  entityId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  changes: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Before and after values'
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true
  }
}, {
  tableName: 'audit_logs',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['entityType'] },
    { fields: ['entityId'] },
    { fields: ['action'] },
    { fields: ['createdAt'] }
  ]
});

module.exports = AuditLog;
