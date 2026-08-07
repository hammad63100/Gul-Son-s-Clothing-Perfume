const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderShipment = sequelize.define('OrderShipment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  trackingNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  carrier: {
    type: DataTypes.STRING,
    allowNull: false
  },
  service: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM(
      'label_created',
      'picked_up',
      'in_transit',
      'out_for_delivery',
      'delivered',
      'exception',
      'returned'
    ),
    defaultValue: 'label_created'
  },
  shippedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  estimatedDeliveryDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  deliveredAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  weight: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: true
  },
  weightUnit: {
    type: DataTypes.STRING,
    defaultValue: 'kg'
  },
  shippingLabel: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  shippingCost: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  insuranceAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true
  }
}, {
  tableName: 'order_shipments',
  timestamps: true,
  indexes: [
    { fields: ['orderId'] },
    { fields: ['trackingNumber'] }
  ]
});

module.exports = OrderShipment;
