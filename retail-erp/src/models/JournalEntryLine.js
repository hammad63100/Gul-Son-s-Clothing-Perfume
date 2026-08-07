const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const JournalEntryLine = sequelize.define('JournalEntryLine', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  journalEntryId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  accountId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  },
  debitAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00
  },
  creditAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00
  },
  taxCode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  taxAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00
  },
  customerId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  vendorId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  projectId: {
    type: DataTypes.UUID,
    allowNull: true
  }
}, {
  tableName: 'journal_entry_lines',
  timestamps: true,
  indexes: [
    { fields: ['journalEntryId'] },
    { fields: ['accountId'] },
    { fields: ['customerId'] },
    { fields: ['vendorId'] }
  ]
});

module.exports = JournalEntryLine;
