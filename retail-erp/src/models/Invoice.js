const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Invoice = sequelize.define('Invoice', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  invoiceNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  customerId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  customerName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  customerEmail: {
    type: DataTypes.STRING,
    allowNull: true
  },
  billingAddress: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  issueDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM(
      'draft',
      'sent',
      'viewed',
      'partial',
      'paid',
      'overdue',
      'cancelled',
      'refunded'
    ),
    defaultValue: 'draft'
  },
  subtotal: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  taxAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  discountAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  shippingAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  totalAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  paidAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  balanceDue: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'USD'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  terms: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  footer: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  paidAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'invoices',
  timestamps: true,
  indexes: [
    { fields: ['invoiceNumber'] },
    { fields: ['customerId'] },
    { fields: ['orderId'] },
    { fields: ['status'] },
    { fields: ['issueDate'] },
    { fields: ['dueDate'] }
  ]
});

module.exports = Invoice;
