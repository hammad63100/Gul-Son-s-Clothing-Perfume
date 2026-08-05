const User = require('./User');
const Role = require('./Role');
const Permission = require('./Permission');
const RolePermission = require('./RolePermission');

// Define relationships
User.belongsTo(Role, { 
  foreignKey: 'roleId', 
  as: 'role',
  onDelete: 'RESTRICT'
});
Role.hasMany(User, { 
  foreignKey: 'roleId', 
  as: 'users' 
});

Role.belongsToMany(Permission, { 
  through: RolePermission, 
  foreignKey: 'roleId',
  otherKey: 'permissionId',
  as: 'permissions'
});
Permission.belongsToMany(Role, { 
  through: RolePermission, 
  foreignKey: 'permissionId',
  otherKey: 'roleId',
  as: 'roles'
});

Role.hasMany(RolePermission, { 
  foreignKey: 'roleId', 
  as: 'rolePermissions' 
});
Permission.hasMany(RolePermission, { 
  foreignKey: 'permissionId', 
  as: 'rolePermissions' 
});
RolePermission.belongsTo(Role, { 
  foreignKey: 'roleId', 
  as: 'role' 
});
RolePermission.belongsTo(Permission, { 
  foreignKey: 'permissionId', 
  as: 'permission' 
});

module.exports = {
  User,
  Role,
  Permission,
  RolePermission
};
