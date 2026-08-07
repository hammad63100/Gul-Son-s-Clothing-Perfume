const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StockTransferItem = sequelize.define('StockTransferItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  stockTransferId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'stock_transfers',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    },
    onDelete: 'RESTRICT'
  },
  variantId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'product_variants',
      key: 'id'
    },
    onDelete: 'RESTRICT'
  },
  quantityRequested: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  quantitySent: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  quantityReceived: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  quantityInTransit: {
    type: DataTypes.VIRTUAL,
    get() {
      const sent = this.getDataValue('quantitySent');
      const received = this.getDataValue('quantityReceived');
      return sent - received;
    }
  },
  unitCost: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  batchNumber: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  expirationDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'stock_transfer_items',
  indexes: [
    {
      fields: ['stockTransferId']
    },
    {
      fields: ['productId']
    },
    {
      fields: ['variantId']
    }
  ]
});

module.exports = StockTransferItem;
