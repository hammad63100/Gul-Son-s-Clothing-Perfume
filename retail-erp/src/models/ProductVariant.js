const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProductVariant = sequelize.define('ProductVariant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  sku: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  barcode: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: {
        args: [2, 200],
        msg: 'Variant name must be between 2 and 200 characters'
      }
    }
  },
  attributes: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Store variant attributes like size, color, etc.'
  },
  price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    validate: {
      min: 0
    },
    comment: 'Override price for this variant (null uses product base price)'
  },
  salePrice: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  costPrice: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  weight: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'product_variants',
  indexes: [
    {
      fields: ['productId']
    },
    {
      fields: ['sku']
    },
    {
      fields: ['barcode']
    }
  ]
});

module.exports = ProductVariant;
