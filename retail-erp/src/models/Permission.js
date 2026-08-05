const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Permission = sequelize.define('Permission', {
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
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  module: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      isIn: {
        args: [['users', 'roles', 'products', 'inventory', 'orders', 'pos', 'customers', 'suppliers', 'purchases', 'accounting', 'reports', 'website', 'blog', 'marketing', 'settings', 'employees']],
        msg: 'Invalid module name'
      }
    }
  },
  action: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: {
        args: [['create', 'read', 'update', 'delete', 'approve', 'export', 'import', 'manage']],
        msg: 'Invalid action'
      }
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'permissions'
});

module.exports = Permission;
