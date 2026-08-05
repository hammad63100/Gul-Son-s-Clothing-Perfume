const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      isIn: {
        args: [['super_admin', 'owner', 'manager', 'cashier', 'sales_employee', 'warehouse_staff', 'inventory_manager', 'accountant', 'delivery_staff', 'customer', 'guest']],
        msg: 'Invalid role name'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isSystemRole: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'roles'
});

// Static method to get role hierarchy
Role.getRoleHierarchy = () => {
  return {
    super_admin: 100,
    owner: 90,
    manager: 80,
    inventory_manager: 70,
    accountant: 70,
    sales_employee: 60,
    warehouse_staff: 50,
    cashier: 40,
    delivery_staff: 30,
    customer: 20,
    guest: 10
  };
};

// Instance method to check if role can manage another role
Role.prototype.canManageRole = function(targetRoleId) {
  const hierarchy = Role.getRoleHierarchy();
  const currentRoleLevel = hierarchy[this.name];
  const targetRole = Role.findByPk(targetRoleId);
  
  if (!targetRole) return false;
  
  const targetRoleLevel = hierarchy[targetRole.name];
  return currentRoleLevel > targetRoleLevel;
};

module.exports = Role;
