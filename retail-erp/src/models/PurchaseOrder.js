const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PurchaseOrder = sequelize.define('PurchaseOrder', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  orderNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  supplierId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'suppliers',
      key: 'id'
    },
    onDelete: 'RESTRICT'
  },
  warehouseId: {
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
      'sent',
      'confirmed',
      'partially_received',
      'received',
      'cancelled'
    ),
    defaultValue: 'draft'
  },
  orderDate: {
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
  subtotal: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  taxAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  shippingCost: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  discountAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  totalAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD'
  },
  paymentTerms: {
    type: DataTypes.STRING(100),
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
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'purchase_orders',
  indexes: [
    {
      fields: ['orderNumber']
    },
    {
      fields: ['supplierId']
    },
    {
      fields: ['warehouseId']
    },
    {
      fields: ['status']
    },
    {
      fields: ['orderDate']
    },
    {
      fields: ['expectedDeliveryDate']
    }
  ]
});

module.exports = PurchaseOrder;
