const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TaxRate = sequelize.define('TaxRate', {
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
  rate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('sales', 'purchase', 'both'),
    defaultValue: 'both'
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  applicableRegions: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Array of region/country codes'
  },
  applicableProductCategories: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Array of category IDs'
  }
}, {
  tableName: 'tax_rates',
  timestamps: true,
  indexes: [
    { fields: ['code'] },
    { fields: ['type'] },
    { fields: ['isDefault'] }
  ]
});

module.exports = TaxRate;
