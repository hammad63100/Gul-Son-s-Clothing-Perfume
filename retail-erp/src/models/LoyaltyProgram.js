const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LoyaltyProgram = sequelize.define('LoyaltyProgram', {
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
  pointsPerDollar: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 1.00
  },
  pointsExpiryMonths: {
    type: DataTypes.INTEGER,
    defaultValue: 12
  },
  redemptionRate: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.01,
    comment: 'Value of each point in dollars'
  },
  minRedemptionPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 100
  },
  tiers: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Tier definitions: [{name, minPoints, benefits}]'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  rules: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Earning and redemption rules'
  }
}, {
  tableName: 'loyalty_programs',
  timestamps: true
});

module.exports = LoyaltyProgram;
