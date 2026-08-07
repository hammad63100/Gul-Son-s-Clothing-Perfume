const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const {
  getWarehouses,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  getInventoryLevels,
  adjustInventory,
  transferStock,
  getStockMovements
} = require('../controllers/inventoryController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRequest } = require('../validators/userValidator');

// Validation rules
const warehouseValidation = [
  body('name').trim().notEmpty().withMessage('Warehouse name is required'),
  body('code').trim().notEmpty().withMessage('Warehouse code is required'),
  body('type').optional().isIn(['warehouse', 'store', 'distribution_center', 'retail_outlet']),
  body('email').optional().isEmail().withMessage('Invalid email format')
];

const inventoryAdjustmentValidation = [
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('warehouseId').notEmpty().withMessage('Warehouse ID is required'),
  body('quantity').isInt({ min: -1000000, max: 1000000 }).withMessage('Valid quantity is required'),
  body('reason').optional().trim()
];

const stockTransferValidation = [
  body('fromWarehouseId').notEmpty().withMessage('Source warehouse is required'),
  body('toWarehouseId').notEmpty().withMessage('Destination warehouse is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.productId').notEmpty().withMessage('Product ID is required for each item'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
];

// Warehouse routes
router.route('/warehouses')
  .get(authenticate, authorize('inventory.view', 'admin'), getWarehouses)
  .post(authenticate, authorize('inventory.manage', 'admin'), warehouseValidation, validateRequest, createWarehouse);

router.route('/warehouses/:id')
  .get(authenticate, authorize('inventory.view', 'admin'), getWarehouseById)
  .put(authenticate, authorize('inventory.manage', 'admin'), warehouseValidation, validateRequest, updateWarehouse)
  .delete(authenticate, authorize('inventory.manage', 'admin'), deleteWarehouse);

// Inventory levels
router.get('/levels', authenticate, authorize('inventory.view', 'admin'), getInventoryLevels);

// Adjust inventory
router.post('/adjust', authenticate, authorize('inventory.manage', 'admin'), inventoryAdjustmentValidation, validateRequest, adjustInventory);

// Transfer stock
router.post('/transfer', authenticate, authorize('inventory.manage', 'admin'), stockTransferValidation, validateRequest, transferStock);

// Stock movements
router.get('/movements', authenticate, authorize('inventory.view', 'admin'), getStockMovements);

module.exports = router;
