const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StockMovement = sequelize.define('StockMovement', {
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
  variantId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'product_variants',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  warehouseId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'warehouses',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  movementType: {
    type: DataTypes.ENUM(
      'receipt',
      'sale',
      'return',
      'transfer_in',
      'transfer_out',
      'adjustment',
      'damage',
      'loss',
      'cycle_count'
    ),
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  quantityBefore: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quantityAfter: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  referenceType: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Type of reference document (e.g., purchase_order, sale_order, transfer_order)'
  },
  referenceId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'ID of the reference document'
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  performedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  costPerUnit: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  totalCost: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  batchNumber: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  serialNumber: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  expirationDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'stock_movements',
  indexes: [
    {
      fields: ['productId']
    },
    {
      fields: ['variantId']
    },
    {
      fields: ['warehouseId']
    },
    {
      fields: ['movementType']
    },
    {
      fields: ['referenceType', 'referenceId']
    },
    {
      fields: ['performedBy']
    },
    {
      fields: ['createdAt']
    }
  ]
});

module.exports = StockMovement;
