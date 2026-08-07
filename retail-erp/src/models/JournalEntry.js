const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const JournalEntry = sequelize.define('JournalEntry', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  entryNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM(
      'sales',
      'purchase',
      'payment',
      'receipt',
      'adjustment',
      'transfer',
      'payroll',
      'tax',
      'other'
    ),
    defaultValue: 'other'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  reference: {
    type: DataTypes.STRING,
    allowNull: true
  },
  referenceType: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'e.g., order_id, invoice_id, payment_id'
  },
  referenceId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  totalDebit: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00
  },
  totalCredit: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00
  },
  isPosted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  postedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  postedBy: {
    type: DataTypes.UUID,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'journal_entries',
  timestamps: true,
  indexes: [
    { fields: ['entryNumber'] },
    { fields: ['date'] },
    { fields: ['type'] },
    { fields: ['isPosted'] },
    { fields: ['referenceId'] }
  ]
});

module.exports = JournalEntry;
