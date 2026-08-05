const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const AuthService = require('../services/authService');
const { authenticate, authorize } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/errorHandler');
const { 
  registerValidation, 
  loginValidation, 
  updateUserValidation, 
  changePasswordValidation,
  getUsersQueryValidation 
} = require('../validators/userValidator');
const logger = require('../config/logger');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', registerValidation, handleValidationErrors, async (req, res, next) => {
  try {
    const result = await AuthService.register(req.body);
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', loginValidation, handleValidationErrors, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await AuthService.getProfile(req.user.id);
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', authenticate, updateUserValidation, handleValidationErrors, async (req, res, next) => {
  try {
    const user = await AuthService.updateProfile(req.user.id, req.body);
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put('/change-password', authenticate, changePasswordValidation, handleValidationErrors, async (req, res, next) => {
  try {
    const result = await AuthService.changePassword(
      req.user.id,
      req.body.currentPassword,
      req.body.newPassword
    );
    
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/auth/users
 * @desc    Get all users with pagination and filters
 * @access  Private (requires users:read permission)
 */
router.get('/users', authenticate, authorize('users:read'), getUsersQueryValidation, handleValidationErrors, async (req, res, next) => {
  try {
    const filters = {
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
      roleId: req.query.roleId,
      isActive: req.query.isActive
    };
    
    const result = await AuthService.getUsers(filters);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/auth/users/:id
 * @desc    Delete (deactivate) a user
 * @access  Private (requires users:delete permission)
 */
router.delete('/users/:id', authenticate, authorize('users:delete'), async (req, res, next) => {
  try {
    const result = await AuthService.deleteUser(req.params.id, req.user.id);
    
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/init-roles
 * @desc    Initialize default roles and permissions (Super Admin only)
 * @access  Private (Super Admin only)
 */
router.post('/init-roles', authenticate, authorize('roles:manage'), async (req, res, next) => {
  try {
    // Check if user is super admin
    if (req.user.role.name !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Only super admin can initialize roles'
      });
    }
    
    await AuthService.initializeRolesAndPermissions();
    
    res.status(200).json({
      success: true,
      message: 'Roles and permissions initialized successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
