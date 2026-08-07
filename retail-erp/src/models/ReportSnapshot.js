const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ReportSnapshot = sequelize.define('ReportSnapshot', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  reportId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  generatedAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  generatedBy: {
    type: DataTypes.UUID,
    allowNull: false
  },
  parameters: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Parameters used for report generation'
  },
  data: {
    type: DataTypes.JSONB,
    allowNull: false,
    comment: 'Report data snapshot'
  },
  summary: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Summary statistics'
  },
  fileUrl: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  format: {
    type: DataTypes.ENUM('json', 'csv', 'pdf', 'xlsx'),
    defaultValue: 'json'
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'report_snapshots',
  timestamps: true,
  indexes: [
    { fields: ['reportId'] },
    { fields: ['generatedAt'] },
    { fields: ['generatedBy'] }
  ]
});

module.exports = ReportSnapshot;
