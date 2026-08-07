const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CustomerSegment = sequelize.define('CustomerSegment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  criteria: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'JSON criteria for segment membership'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  autoUpdate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'customer_segments',
  timestamps: true
});

module.exports = CustomerSegment;
