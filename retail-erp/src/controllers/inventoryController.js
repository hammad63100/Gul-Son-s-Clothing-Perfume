const { Op } = require('sequelize');
const {
  Warehouse,
  Inventory,
  StockMovement,
  Supplier,
  PurchaseOrder,
  PurchaseOrderItem,
  StockTransfer,
  StockTransferItem,
  Product,
  ProductVariant
} = require('../models');
const logger = require('../config/logger');

/**
 * @desc Get all warehouses
 * @route GET /api/inventory/warehouses
 * @access Private
 */
const getWarehouses = async (req, res, next) => {
  try {
    const { type, isActive, page = 1, limit = 20 } = req.query;
    
    const where = {};
    if (type) where.type = type;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    
    const offset = (page - 1) * limit;
    
    const result = await Warehouse.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['name', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      data: result.rows,
      pagination: {
        total: result.count,
        page: parseInt(page),
        pages: Math.ceil(result.count / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching warehouses:', error);
    next(error);
  }
};

/**
 * @desc Get single warehouse
 * @route GET /api/inventory/warehouses/:id
 * @access Private
 */
const getWarehouseById = async (req, res, next) => {
  try {
    const warehouse = await Warehouse.findByPk(req.params.id, {
      include: [{
        model: Inventory,
        as: 'inventoryItems',
        limit: 100,
        include: [
          { model: Product, as: 'product' },
          { model: ProductVariant, as: 'variant' }
        ]
      }]
    });
    
    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: warehouse
    });
  } catch (error) {
    logger.error('Error fetching warehouse:', error);
    next(error);
  }
};

/**
 * @desc Create warehouse
 * @route POST /api/inventory/warehouses
 * @access Private
 */
const createWarehouse = async (req, res, next) => {
  try {
    const warehouse = await Warehouse.create({
      ...req.body,
      createdBy: req.user?.id
    });
    
    res.status(201).json({
      success: true,
      data: warehouse
    });
  } catch (error) {
    logger.error('Error creating warehouse:', error);
    next(error);
  }
};

/**
 * @desc Update warehouse
 * @route PUT /api/inventory/warehouses/:id
 * @access Private
 */
const updateWarehouse = async (req, res, next) => {
  try {
    const warehouse = await Warehouse.findByPk(req.params.id);
    
    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found'
      });
    }
    
    await warehouse.update(req.body);
    
    res.status(200).json({
      success: true,
      data: warehouse
    });
  } catch (error) {
    logger.error('Error updating warehouse:', error);
    next(error);
  }
};

/**
 * @desc Delete warehouse
 * @route DELETE /api/inventory/warehouses/:id
 * @access Private
 */
const deleteWarehouse = async (req, res, next) => {
  try {
    const warehouse = await Warehouse.findByPk(req.params.id);
    
    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found'
      });
    }
    
    // Soft delete by setting isActive to false
    await warehouse.update({ isActive: false });
    
    res.status(200).json({
      success: true,
      message: 'Warehouse deactivated successfully'
    });
  } catch (error) {
    logger.error('Error deleting warehouse:', error);
    next(error);
  }
};

/**
 * @desc Get inventory levels
 * @route GET /api/inventory/levels
 * @access Private
 */
const getInventoryLevels = async (req, res, next) => {
  try {
    const { productId, variantId, warehouseId, lowStockOnly, page = 1, limit = 50 } = req.query;
    
    const where = {};
    if (productId) where.productId = productId;
    if (variantId) where.variantId = variantId;
    if (warehouseId) where.warehouseId = warehouseId;
    
    const offset = (page - 1) * limit;
    
    const result = await Inventory.findAndCountAll({
      where,
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name', 'sku'] },
        { model: ProductVariant, as: 'variant', attributes: ['id', 'sku'] },
        { model: Warehouse, as: 'warehouse', attributes: ['id', 'name', 'code'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['quantityAvailable', 'ASC']]
    });
    
    let data = result.rows;
    
    // Filter for low stock if requested
    if (lowStockOnly === 'true') {
      data = data.filter(item => item.quantityAvailable <= item.reorderPoint);
    }
    
    res.status(200).json({
      success: true,
      data,
      pagination: {
        total: result.count,
        page: parseInt(page),
        pages: Math.ceil(result.count / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching inventory levels:', error);
    next(error);
  }
};

/**
 * @desc Adjust inventory
 * @route POST /api/inventory/adjust
 * @access Private
 */
const adjustInventory = async (req, res, next) => {
  try {
    const { productId, variantId, warehouseId, quantity, reason, batchNumber, expirationDate } = req.body;
    
    const inventory = await Inventory.findOne({
      where: { productId, variantId: variantId || null, warehouseId }
    });
    
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory record not found'
      });
    }
    
    const quantityBefore = inventory.quantityOnHand;
    const movementType = quantity > 0 ? 'adjustment' : 'adjustment';
    
    await inventory.addStock(Math.abs(quantity), { updateLastRestocked: quantity > 0 });
    
    // Create stock movement record
    await StockMovement.create({
      productId,
      variantId: variantId || null,
      warehouseId,
      movementType,
      quantity: Math.abs(quantity),
      quantityBefore,
      quantityAfter: inventory.quantityOnHand,
      reason,
      performedBy: req.user?.id,
      batchNumber,
      expirationDate
    });
    
    res.status(200).json({
      success: true,
      message: 'Inventory adjusted successfully',
      data: inventory
    });
  } catch (error) {
    logger.error('Error adjusting inventory:', error);
    next(error);
  }
};

/**
 * @desc Transfer stock between warehouses
 * @route POST /api/inventory/transfer
 * @access Private
 */
const transferStock = async (req, res, next) => {
  try {
    const { fromWarehouseId, toWarehouseId, items, notes } = req.body;
    
    // Create stock transfer
    const transferNumber = `TRF-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    
    const transfer = await StockTransfer.create({
      transferNumber,
      fromWarehouseId,
      toWarehouseId,
      status: 'draft',
      transferDate: new Date(),
      notes,
      createdBy: req.user?.id
    });
    
    // Create transfer items
    for (const item of items) {
      await StockTransferItem.create({
        stockTransferId: transfer.id,
        productId: item.productId,
        variantId: item.variantId || null,
        quantityRequested: item.quantity,
        unitCost: item.unitCost || 0
      });
      
      // Deduct from source warehouse
      const sourceInventory = await Inventory.findOne({
        where: {
          productId: item.productId,
          variantId: item.variantId || null,
          warehouseId: fromWarehouseId
        }
      });
      
      if (sourceInventory) {
        await sourceInventory.removeStock(item.quantity, 'transfer_out');
        
        await StockMovement.create({
          productId: item.productId,
          variantId: item.variantId || null,
          warehouseId: fromWarehouseId,
          movementType: 'transfer_out',
          quantity: item.quantity,
          quantityBefore: sourceInventory.quantityOnHand + item.quantity,
          quantityAfter: sourceInventory.quantityOnHand,
          referenceType: 'stock_transfer',
          referenceId: transfer.id,
          performedBy: req.user?.id
        });
      }
    }
    
    res.status(201).json({
      success: true,
      message: 'Stock transfer created successfully',
      data: transfer
    });
  } catch (error) {
    logger.error('Error transferring stock:', error);
    next(error);
  }
};

/**
 * @desc Get stock movements
 * @route GET /api/inventory/movements
 * @access Private
 */
const getStockMovements = async (req, res, next) => {
  try {
    const { productId, warehouseId, movementType, startDate, endDate, page = 1, limit = 50 } = req.query;
    
    const where = {};
    if (productId) where.productId = productId;
    if (warehouseId) where.warehouseId = warehouseId;
    if (movementType) where.movementType = movementType;
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }
    
    const offset = (page - 1) * limit;
    
    const result = await StockMovement.findAndCountAll({
      where,
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name', 'sku'] },
        { model: ProductVariant, as: 'variant', attributes: ['id', 'sku'] },
        { model: Warehouse, as: 'warehouse', attributes: ['id', 'name', 'code'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      data: result.rows,
      pagination: {
        total: result.count,
        page: parseInt(page),
        pages: Math.ceil(result.count / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching stock movements:', error);
    next(error);
  }
};

module.exports = {
  getWarehouses,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  getInventoryLevels,
  adjustInventory,
  transferStock,
  getStockMovements
};
