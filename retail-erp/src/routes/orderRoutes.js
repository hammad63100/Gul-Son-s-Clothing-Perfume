const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const orderController = require('../controllers/orderController');

// Middleware to check order permissions
const checkOrderPermission = (action) => authorize(`order.${action}`);

/**
 * @route   GET /api/orders
 * @desc    Get all orders with filtering
 * @access  Private
 */
router.get('/', 
  authenticate, 
  checkOrderPermission('view'),
  orderController.getOrders
);

/**
 * @route   POST /api/orders
 * @desc    Create a new order
 * @access  Private
 */
router.post('/', 
  authenticate, 
  checkOrderPermission('create'),
  orderController.createOrder
);

/**
 * @route   GET /api/orders/:id
 * @desc    Get a single order
 * @access  Private
 */
router.get('/:id', 
  authenticate, 
  checkOrderPermission('view'),
  orderController.getOrder
);

/**
 * @route   PATCH /api/orders/:id/status
 * @desc    Update order status
 * @access  Private
 */
router.patch('/:id/status', 
  authenticate, 
  checkOrderPermission('update_status'),
  orderController.updateOrderStatus
);

/**
 * @route   POST /api/orders/:id/payments
 * @desc    Record payment for an order
 * @access  Private
 */
router.post('/:id/payments', 
  authenticate, 
  checkOrderPermission('record_payment'),
  orderController.recordPayment
);

/**
 * @route   POST /api/orders/:id/shipments
 * @desc    Create shipment for an order
 * @access  Private
 */
router.post('/:id/shipments', 
  authenticate, 
  checkOrderPermission('create_shipment'),
  orderController.createShipment
);

/**
 * @route   GET /api/orders/statistics
 * @desc    Get order statistics
 * @access  Private
 */
router.get('/statistics', 
  authenticate, 
  checkOrderPermission('view'),
  orderController.getStatistics
);

module.exports = router;
