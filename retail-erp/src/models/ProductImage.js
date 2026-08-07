const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProductImage = sequelize.define('ProductImage', {
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
    onDelete: 'SET NULL'
  },
  imageUrl: {
    type: DataTypes.STRING(500),
    allowNull: false,
    validate: {
      notEmpty: true,
      isUrl: true
    }
  },
  thumbnailUrl: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  altText: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  caption: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isPrimary: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  imageSize: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Image size in bytes'
  },
  mimeType: {
    type: DataTypes.STRING(50),
    defaultValue: 'image/jpeg'
  }
}, {
  tableName: 'product_images',
  indexes: [
    {
      fields: ['productId']
    },
    {
      fields: ['variantId']
    },
    {
      fields: ['isPrimary']
    }
  ]
});

module.exports = ProductImage;
