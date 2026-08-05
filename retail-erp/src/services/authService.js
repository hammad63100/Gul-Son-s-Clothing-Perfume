const { User, Role, Permission, RolePermission } = require('../models');
const { generateToken } = require('../middleware/auth');
const logger = require('../config/logger');

class AuthService {
  // Register new user
  static async register(userData) {
    const transaction = await User.sequelize.transaction();
    
    try {
      // Check if email already exists
      const existingUser = await User.findOne({ where: { email: userData.email } });
      if (existingUser) {
        const error = new Error('Email already registered');
        error.statusCode = 409;
        throw error;
      }

      // Default to customer role if no role specified
      let roleId = userData.roleId;
      if (!roleId) {
        const customerRole = await Role.findOne({ where: { name: 'customer' } });
        roleId = customerRole.id;
      }

      // Create user
      const user = await User.create({
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        roleId: roleId
      }, { transaction });

      await transaction.commit();

      // Generate token
      const token = generateToken(user.id, user.roleId);

      return {
        user,
        token
      };
    } catch (error) {
      await transaction.rollback();
      logger.error('Registration error:', error);
      throw error;
    }
  }

  // Login user
  static async login(email, password) {
    try {
      // Find user with role
      const user = await User.findOne({
        where: { email },
        include: [{
          model: Role,
          as: 'role',
          attributes: ['id', 'name', 'isActive']
        }]
      });

      if (!user) {
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        throw error;
      }

      // Check if user is active
      if (!user.isActive) {
        const error = new Error('Account is deactivated. Please contact support.');
        error.statusCode = 403;
        throw error;
      }

      // Check if role is active
      if (!user.role || !user.role.isActive) {
        const error = new Error('Invalid user role. Please contact support.');
        error.statusCode = 403;
        throw error;
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        throw error;
      }

      // Update last login time
      user.lastLoginAt = new Date();
      await user.save();

      // Generate token
      const token = generateToken(user.id, user.roleId);

      return {
        user,
        token
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  // Get current user profile
  static async getProfile(userId) {
    const user = await User.findByPk(userId, {
      include: [{
        model: Role,
        as: 'role',
        include: [{
          model: Permission,
          as: 'permissions',
          where: { isActive: true },
          required: false,
          through: { attributes: ['isGranted'] }
        }],
        attributes: ['id', 'name', 'description', 'isActive']
      }],
      attributes: { exclude: ['password', 'twoFactorSecret'] }
    });

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    return user;
  }

  // Update user profile
  static async updateProfile(userId, updateData) {
    const transaction = await User.sequelize.transaction();
    
    try {
      const user = await User.findByPk(userId);
      
      if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
      }

      // Check email uniqueness if email is being updated
      if (updateData.email && updateData.email !== user.email) {
        const existingUser = await User.findOne({ where: { email: updateData.email } });
        if (existingUser) {
          const error = new Error('Email already in use');
          error.statusCode = 409;
          throw error;
        }
      }

      await user.update(updateData, { transaction });
      await transaction.commit();

      return await User.findByPk(userId, {
        attributes: { exclude: ['password', 'twoFactorSecret'] }
      });
    } catch (error) {
      await transaction.rollback();
      logger.error('Update profile error:', error);
      throw error;
    }
  }

  // Change password
  static async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findByPk(userId);
    
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    await user.changePassword(currentPassword, newPassword);
    
    return { message: 'Password changed successfully' };
  }

  // Get all users (with pagination and filters)
  static async getUsers(filters = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      roleId,
      isActive
    } = filters;

    const offset = (page - 1) * limit;
    const where = {};

    // Build where clause
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (roleId) {
      where.roleId = roleId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      include: [{
        model: Role,
        as: 'role',
        attributes: ['id', 'name', 'description']
      }],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: { exclude: ['password', 'twoFactorSecret'] }
    });

    return {
      users: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
        hasMore: offset + rows.length < count
      }
    };
  }

  // Delete user (soft delete by deactivating)
  static async deleteUser(userId, requesterId) {
    const transaction = await User.sequelize.transaction();
    
    try {
      const user = await User.findByPk(userId);
      
      if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
      }

      // Prevent self-deletion
      if (user.id === requesterId) {
        const error = new Error('Cannot delete your own account');
        error.statusCode = 400;
        throw error;
      }

      // Soft delete by deactivating
      user.isActive = false;
      await user.save({ transaction });

      await transaction.commit();

      return { message: 'User deactivated successfully' };
    } catch (error) {
      await transaction.rollback();
      logger.error('Delete user error:', error);
      throw error;
    }
  }

  // Initialize default roles and permissions
  static async initializeRolesAndPermissions() {
    const transaction = await User.sequelize.transaction();
    
    try {
      // Define roles
      const rolesData = [
        { name: 'super_admin', description: 'System administrator with full access', isSystemRole: true },
        { name: 'owner', description: 'Business owner with full business access', isSystemRole: true },
        { name: 'manager', description: 'Store manager with operational access', isSystemRole: true },
        { name: 'cashier', description: 'Point of sale operator', isSystemRole: true },
        { name: 'sales_employee', description: 'Sales staff member', isSystemRole: true },
        { name: 'warehouse_staff', description: 'Warehouse operations staff', isSystemRole: true },
        { name: 'inventory_manager', description: 'Inventory management specialist', isSystemRole: true },
        { name: 'accountant', description: 'Financial records manager', isSystemRole: true },
        { name: 'delivery_staff', description: 'Delivery and logistics staff', isSystemRole: true },
        { name: 'customer', description: 'Registered customer', isSystemRole: true },
        { name: 'guest', description: 'Guest user with limited access', isSystemRole: true }
      ];

      // Create roles
      for (const roleData of rolesData) {
        await Role.findOrCreate({
          where: { name: roleData.name },
          defaults: roleData
        }, { transaction });
      }

      // Define permissions
      const modules = ['users', 'roles', 'products', 'inventory', 'orders', 'pos', 'customers', 'suppliers', 'purchases', 'accounting', 'reports', 'website', 'blog', 'marketing', 'settings', 'employees'];
      const actions = ['create', 'read', 'update', 'delete', 'approve', 'export', 'import', 'manage'];

      for (const module of modules) {
        for (const action of actions) {
          await Permission.findOrCreate({
            where: { 
              name: `${module}:${action}`,
              module: module,
              action: action
            },
            defaults: {
              name: `${module}:${action}`,
              description: `Permission to ${action} ${module}`,
              module: module,
              action: action
            }
          }, { transaction });
        }
      }

      // Assign permissions to roles
      const superAdminRole = await Role.findOne({ where: { name: 'super_admin' }, transaction });
      const allPermissions = await Permission.findAll({ transaction });
      
      // Grant all permissions to super admin
      for (const permission of allPermissions) {
        await RolePermission.findOrCreate({
          where: {
            roleId: superAdminRole.id,
            permissionId: permission.id
          },
          defaults: {
            roleId: superAdminRole.id,
            permissionId: permission.id,
            isGranted: true
          }
        }, { transaction });
      }

      await transaction.commit();
      logger.info('Roles and permissions initialized successfully');
    } catch (error) {
      await transaction.rollback();
      logger.error('Error initializing roles and permissions:', error);
      throw error;
    }
  }
}

// Import Op from sequelize
const { Op } = require('sequelize');

module.exports = AuthService;
