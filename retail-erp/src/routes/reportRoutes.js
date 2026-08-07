const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const reportController = require('../controllers/reportController');

// Middleware to check reporting permissions
const checkReportPermission = (action) => authorize(`report.${action}`);

/**
 * @route   GET /api/reports
 * @desc    Get all report definitions
 * @access  Private
 */
router.get('/', 
  authenticate, 
  checkReportPermission('view'),
  reportController.getReports
);

/**
 * @route   POST /api/reports
 * @desc    Create a new report definition
 * @access  Private
 */
router.post('/', 
  authenticate, 
  checkReportPermission('create'),
  reportController.createReport
);

/**
 * @route   GET /api/reports/sales
 * @desc    Generate sales report
 * @access  Private
 */
router.get('/sales', 
  authenticate, 
  checkReportPermission('view_sales'),
  reportController.generateSalesReport
);

/**
 * @route   GET /api/reports/inventory
 * @desc    Generate inventory report
 * @access  Private
 */
router.get('/inventory', 
  authenticate, 
  checkReportPermission('view_inventory'),
  reportController.generateInventoryReport
);

/**
 * @route   GET /api/reports/customers
 * @desc    Generate customer report
 * @access  Private
 */
router.get('/customers', 
  authenticate, 
  checkReportPermission('view_customers'),
  reportController.generateCustomerReport
);

/**
 * @route   GET /api/reports/pos
 * @desc    Generate POS report
 * @access  Private
 */
router.get('/pos', 
  authenticate, 
  checkReportPermission('view_pos'),
  reportController.generatePOSReport
);

/**
 * @route   GET /api/reports/dashboard
 * @desc    Get dashboard metrics
 * @access  Private
 */
router.get('/dashboard', 
  authenticate, 
  checkReportPermission('view_dashboard'),
  reportController.getDashboardMetrics
);

/**
 * @route   POST /api/reports/:id/snapshots
 * @desc    Save report snapshot
 * @access  Private
 */
router.post('/:id/snapshots', 
  authenticate, 
  checkReportPermission('create'),
  reportController.saveSnapshot
);

module.exports = router;
