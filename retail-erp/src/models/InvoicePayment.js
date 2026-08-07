const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InvoicePayment = sequelize.define('InvoicePayment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  invoiceId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  paymentDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false
  },
  reference: {
    type: DataTypes.STRING,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  journalEntryId: {
    type: DataTypes.UUID,
    allowNull: true
  }
}, {
  tableName: 'invoice_payments',
  timestamps: true,
  indexes: [
    { fields: ['invoiceId'] }
  ]
});

module.exports = InvoicePayment;
