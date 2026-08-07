const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Customer = sequelize.define('Customer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: true
  },
  customerType: {
    type: DataTypes.ENUM('retail', 'wholesale', 'vip', 'corporate'),
    defaultValue: 'retail'
  },
  loyaltyPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalPurchases: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  averageOrderValue: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  lastPurchaseDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  preferredContactMethod: {
    type: DataTypes.ENUM('email', 'phone', 'sms', 'whatsapp'),
    defaultValue: 'email'
  },
  marketingOptIn: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'customers',
  timestamps: true,
  indexes: [
    { fields: ['email'] },
    { fields: ['phone'] },
    { fields: ['customerType'] },
    { fields: ['loyaltyPoints'] }
  ]
});

module.exports = Customer;
