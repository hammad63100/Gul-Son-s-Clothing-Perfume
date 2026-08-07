const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Brand = sequelize.define('Brand', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: {
        args: [2, 100],
        msg: 'Brand name must be between 2 and 100 characters'
      }
    }
  },
  slug: {
    type: DataTypes.STRING(150),
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
  logoUrl: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  websiteUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  country: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  metaTitle: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  metaDescription: {
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
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'brands',
  indexes: [
    {
      fields: ['slug']
    },
    {
      fields: ['name']
    }
  ]
});

module.exports = Brand;
