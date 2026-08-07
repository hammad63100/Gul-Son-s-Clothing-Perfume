const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StockTransfer = sequelize.define('StockTransfer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  transferNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  fromWarehouseId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'warehouses',
      key: 'id'
    },
    onDelete: 'RESTRICT'
  },
  toWarehouseId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'warehouses',
      key: 'id'
    },
    onDelete: 'RESTRICT'
  },
  status: {
    type: DataTypes.ENUM(
      'draft',
      'pending_approval',
      'approved',
      'in_transit',
      'partially_received',
      'received',
      'cancelled'
    ),
    defaultValue: 'draft'
  },
  transferDate: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  },
  expectedDeliveryDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  actualDeliveryDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  shippingMethod: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  trackingNumber: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  shippingCost: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  internalNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  approvedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  shippedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  shippedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  receivedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'stock_transfers',
  indexes: [
    {
      fields: ['transferNumber']
    },
    {
      fields: ['fromWarehouseId']
    },
    {
      fields: ['toWarehouseId']
    },
    {
      fields: ['status']
    },
    {
      fields: ['transferDate']
    }
  ]
});

module.exports = StockTransfer;
