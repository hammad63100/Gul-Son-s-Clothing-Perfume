const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: {
        args: [2, 100],
        msg: 'Category name must be between 2 and 100 characters'
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
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'categories',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  imageUrl: {
    type: DataTypes.STRING(500),
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
  }
}, {
  tableName: 'categories',
  indexes: [
    {
      fields: ['slug']
    },
    {
      fields: ['parentId']
    },
    {
      fields: ['level']
    }
  ]
});

// Instance method to get full path
Category.prototype.getFullPath = async function() {
  if (!this.parentId) {
    return this.name;
  }
  
  const parent = await Category.findByPk(this.parentId);
  if (!parent) {
    return this.name;
  }
  
  const parentPath = await parent.getFullPath();
  return `${parentPath} > ${this.name}`;
};

// Static method to get category tree
Category.getCategoryTree = async function(parentId = null, level = 0) {
  const where = parentId ? { parentId } : { parentId: null };
  const categories = await this.findAll({
    where,
    order: [['sortOrder', 'ASC'], ['name', 'ASC']],
    attributes: ['id', 'name', 'slug', 'parentId', 'level', 'imageUrl', 'isActive']
  });
  
  const result = [];
  for (const category of categories) {
    const children = await this.getCategoryTree(category.id, level + 1);
    result.push({
      ...category.toJSON(),
      children
    });
  }
  
  return result;
};

module.exports = Category;
