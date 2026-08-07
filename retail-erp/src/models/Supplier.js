const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Supplier = sequelize.define('Supplier', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(300),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: {
        args: [2, 300],
        msg: 'Supplier name must be between 2 and 300 characters'
      }
    }
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  contactPerson: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(200),
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  mobile: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  website: {
    type: DataTypes.STRING(300),
    allowNull: true
  },
  address: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  country: {
    type: DataTypes.STRING(100),
    defaultValue: 'USA'
  },
  postalCode: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  taxId: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  paymentTerms: {
    type: DataTypes.STRING(100),
    defaultValue: 'Net 30'
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD'
  },
  leadTimeDays: {
    type: DataTypes.INTEGER,
    defaultValue: 7,
    validate: {
      min: 0
    }
  },
  minimumOrderValue: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.00,
    validate: {
      min: 0,
      max: 5
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isPreferred: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'suppliers',
  indexes: [
    {
      fields: ['code']
    },
    {
      fields: ['isActive']
    },
    {
      fields: ['isPreferred']
    },
    {
      fields: ['country']
    }
  ]
});

module.exports = Supplier;
