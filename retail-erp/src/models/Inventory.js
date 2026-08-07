const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Inventory = sequelize.define('Inventory', {
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
  quantityOnHand: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  quantityReserved: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  quantityAvailable: {
    type: DataTypes.VIRTUAL,
    get() {
      const onHand = this.getDataValue('quantityOnHand');
      const reserved = this.getDataValue('quantityReserved');
      return onHand - reserved;
    }
  },
  reorderPoint: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
    validate: {
      min: 0
    }
  },
  reorderQuantity: {
    type: DataTypes.INTEGER,
    defaultValue: 50,
    validate: {
      min: 1
    }
  },
  binLocation: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  aisle: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  shelf: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  lastCountedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  lastRestockedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'inventory',
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
      unique: true,
      fields: ['productId', 'variantId', 'warehouseId'],
      name: 'unique_product_variant_warehouse'
    }
  ]
});

// Static method to get available quantity for a product
Inventory.getAvailableQuantity = async function(productId, variantId = null, warehouseId = null) {
  const where = { productId };
  if (variantId) where.variantId = variantId;
  if (warehouseId) where.warehouseId = warehouseId;
  
  const inventory = await this.findOne({ where });
  return inventory ? inventory.quantityAvailable : 0;
};

// Static method to check if stock is low
Inventory.isLowStock = async function(productId, variantId = null, warehouseId = null) {
  const where = { productId };
  if (variantId) where.variantId = variantId;
  if (warehouseId) where.warehouseId = warehouseId;
  
  const inventory = await this.findOne({ where });
  if (!inventory) return true;
  
  return inventory.quantityAvailable <= inventory.reorderPoint;
};

// Instance method to reserve stock
Inventory.prototype.reserveStock = async function(quantity) {
  if (quantity > this.quantityAvailable) {
    throw new Error('Insufficient available stock');
  }
  
  this.quantityReserved += quantity;
  await this.save();
  return this;
};

// Instance method to release reserved stock
Inventory.prototype.releaseStock = async function(quantity) {
  const releaseAmount = Math.min(quantity, this.quantityReserved);
  this.quantityReserved -= releaseAmount;
  await this.save();
  return this;
};

// Instance method to add stock
Inventory.prototype.addStock = async function(quantity, options = {}) {
  this.quantityOnHand += quantity;
  if (options.updateLastRestocked) {
    this.lastRestockedAt = new Date();
  }
  await this.save(options);
  return this;
};

// Instance method to remove stock
Inventory.prototype.removeStock = async function(quantity, reason = 'adjustment') {
  if (quantity > this.quantityAvailable) {
    throw new Error('Insufficient available stock for removal');
  }
  
  this.quantityOnHand -= quantity;
  // Adjust reserved if necessary
  if (this.quantityReserved > this.quantityAvailable) {
    this.quantityReserved = this.quantityAvailable;
  }
  await this.save();
  return this;
};

module.exports = Inventory;
