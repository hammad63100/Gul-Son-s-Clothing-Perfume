const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(500),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: {
        args: [2, 500],
        msg: 'Product name must be between 2 and 500 characters'
      }
    }
  },
  slug: {
    type: DataTypes.STRING(600),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      is: /^[a-z0-9]+(?:-[a-z0-9]+)*$/i
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  shortDescription: {
    type: DataTypes.STRING(1000),
    allowNull: true
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'categories',
      key: 'id'
    },
    onDelete: 'RESTRICT'
  },
  brandId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'brands',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  sku: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  barcode: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true
  },
  basePrice: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  salePrice: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  costPrice: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  taxRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00,
    validate: {
      min: 0,
      max: 100
    }
  },
  trackInventory: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lowStockThreshold: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
    validate: {
      min: 0
    }
  },
  productType: {
    type: DataTypes.ENUM('simple', 'variable', 'bundle', 'grouped'),
    defaultValue: 'simple'
  },
  weight: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  weightUnit: {
    type: DataTypes.ENUM('kg', 'g', 'lb', 'oz'),
    defaultValue: 'kg'
  },
  length: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  width: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  height: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  dimensionUnit: {
    type: DataTypes.ENUM('cm', 'mm', 'in', 'ft'),
    defaultValue: 'cm'
  },
  metaTitle: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  metaDescription: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  metaKeywords: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  videoUrl: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  }
}, {
  tableName: 'products',
  indexes: [
    {
      fields: ['slug']
    },
    {
      fields: ['sku']
    },
    {
      fields: ['barcode']
    },
    {
      fields: ['categoryId']
    },
    {
      fields: ['brandId']
    },
    {
      fields: ['isActive']
    },
    {
      fields: ['isPublished']
    }
  ]
});

// Generate SKU helper
Product.generateSKU = function(categoryCode, brandCode, variantData) {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${categoryCode}-${brandCode}-${variantData}-${timestamp}${random}`;
};

// Instance method to check if on sale
Product.prototype.isOnSale = function() {
  return this.salePrice !== null && 
         parseFloat(this.salePrice) < parseFloat(this.basePrice);
};

// Instance method to get current price
Product.prototype.getCurrentPrice = function() {
  if (this.salePrice && this.isOnSale()) {
    return this.salePrice;
  }
  return this.basePrice;
};

module.exports = Product;
