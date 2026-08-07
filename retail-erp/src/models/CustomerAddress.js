const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CustomerAddress = sequelize.define('CustomerAddress', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  addressType: {
    type: DataTypes.ENUM('billing', 'shipping', 'both'),
    defaultValue: 'both'
  },
  street1: {
    type: DataTypes.STRING,
    allowNull: false
  },
  street2: {
    type: DataTypes.STRING,
    allowNull: true
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false
  },
  state: {
    type: DataTypes.STRING,
    allowNull: false
  },
  postalCode: {
    type: DataTypes.STRING,
    allowNull: false
  },
  country: {
    type: DataTypes.STRING,
    defaultValue: 'USA'
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  }
}, {
  tableName: 'customer_addresses',
  timestamps: true
});

module.exports = CustomerAddress;
