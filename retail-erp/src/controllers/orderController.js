const { Order, OrderItem, OrderPayment, OrderShipment, Product, ProductVariant, Inventory, Customer, User } = require('../models');
const logger = require('../config/logger');
const { Op } = require('sequelize');

/**
 * @desc    Get all orders
 * @route   GET /api/orders
 * @access  Private
 */
exports.getOrders = async (req, res, next) => {
  try {
    const { status, customerId, startDate, endDate, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;
    
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    
    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        },
        {
          model: User,
          as: 'assignedTo',
          attributes: ['id', 'username', 'firstName', 'lastName']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

/**
 * @desc    Create a new order
 * @route   POST /api/orders
 * @access  Private
 */
exports.createOrder = async (req, res, next) => {
  try {
    const { customerId, items, shippingAddress, billingAddress, notes, assignedToId, source = 'manual' } = req.body;
    
    // Calculate totals
    let subtotal = 0;
    const processedItems = [];
    
    for (const item of items) {
      const { productId, variantId, quantity } = item;
      
      const product = await Product.findByPk(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${productId} not found`
        });
      }
      
      let price = parseFloat(product.price);
      
      if (variantId) {
        const variant = await ProductVariant.findByPk(variantId);
        if (!variant) {
          return res.status(404).json({
            success: false,
            message: `Variant ${variantId} not found`
          });
        }
        price = parseFloat(variant.price || product.price);
        
        // Check inventory
        const inventory = await Inventory.findOne({
          where: { productId, variantId }
        });
        
        if (!inventory || inventory.quantity < quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${product.name}`
          });
        }
      }
      
      const itemTotal = price * parseInt(quantity);
      subtotal += itemTotal;
      processedItems.push({ ...item, price, total: itemTotal });
    }
    
    const taxAmount = subtotal * (parseFloat(req.body.taxRate) || 0.08);
    const discountAmount = parseFloat(req.body.discount) || 0;
    const shippingCost = parseFloat(req.body.shippingCost) || 0;
    const totalAmount = subtotal + taxAmount + shippingCost - discountAmount;
    
    // Create order
    const order = await Order.create({
      customerId,
      items: processedItems,
      subtotal,
      taxAmount,
      discountAmount,
      shippingCost,
      totalAmount,
      shippingAddress,
      billingAddress,
      notes,
      assignedToId,
      source,
      status: 'pending'
    });
    
    // Reserve inventory
    for (const item of processedItems) {
      if (item.variantId) {
        const inventory = await Inventory.findOne({
          where: { 
            productId: item.productId, 
            variantId: item.variantId 
          }
        });
        
        if (inventory) {
          await inventory.increment('reservedQuantity', { by: item.quantity });
        }
      }
    }
    
    res.status(201).json({
      success: true,
      data: order,
      message: 'Order created successfully'
    });
  } catch (error) {
    logger.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

/**
 * @desc    Get a single order
 * @route   GET /api/orders/:id
 * @access  Private
 */
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        },
        {
          model: User,
          as: 'assignedTo',
          attributes: ['id', 'username', 'firstName', 'lastName']
        },
        {
          model: OrderPayment,
          as: 'payments'
        },
        {
          model: OrderShipment,
          as: 'shipments'
        }
      ]
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    logger.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
};

/**
 * @desc    Update order status
 * @route   PATCH /api/orders/:id/status
 * @access  Private
 */
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const order = await Order.findByPk(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Validate status transition
    const validTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: ['completed'],
      cancelled: [],
      completed: []
    };
    
    if (!validTransitions[order.status] || !validTransitions[order.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${order.status} to ${status}`
      });
    }
    
    // If cancelling, release reserved inventory
    if (status === 'cancelled') {
      for (const item of order.items) {
        if (item.variantId) {
          const inventory = await Inventory.findOne({
            where: { 
              productId: item.productId, 
              variantId: item.variantId 
            }
          });
          
          if (inventory) {
            await inventory.decrement('reservedQuantity', { by: item.quantity });
          }
        }
      }
    }
    
    // If shipping, deduct inventory
    if (status === 'shipped') {
      const { StockMovement } = require('../models');
      
      for (const item of order.items) {
        if (item.variantId) {
          const inventory = await Inventory.findOne({
            where: { 
              productId: item.productId, 
              variantId: item.variantId 
            }
          });
          
          if (inventory) {
            await inventory.decrement('quantity', { by: item.quantity });
            await inventory.decrement('reservedQuantity', { by: item.quantity });
            
            await StockMovement.create({
              productId: item.productId,
              variantId: item.variantId,
              warehouseId: inventory.warehouseId,
              type: 'sale',
              quantity: -item.quantity,
              referenceType: 'order',
              referenceId: order.id,
              notes: `Order ${order.orderNumber} shipped`
            });
          }
        }
      }
    }
    
    await order.update({ status, notes: notes ? `${order.notes || ''}\n${notes}` : order.notes });
    
    res.status(200).json({
      success: true,
      data: order,
      message: `Order status updated to ${status}`
    });
  } catch (error) {
    logger.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};

/**
 * @desc    Record order payment
 * @route   POST /api/orders/:id/payments
 * @access  Private
 */
exports.recordPayment = async (req, res, next) => {
  try {
    const { amount, paymentMethod, paymentReference, notes } = req.body;
    const order = await Order.findByPk(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    const payment = await OrderPayment.create({
      orderId: order.id,
      amount: parseFloat(amount),
      paymentMethod,
      paymentReference,
      notes,
      status: 'completed'
    });
    
    // Check if fully paid
    const payments = await OrderPayment.findAll({
      where: { orderId: order.id, status: 'completed' }
    });
    
    const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    
    if (totalPaid >= order.totalAmount && order.status === 'confirmed') {
      await order.update({ status: 'processing', paymentStatus: 'paid' });
    } else if (totalPaid > 0) {
      await order.update({ paymentStatus: 'partial' });
    }
    
    res.status(201).json({
      success: true,
      data: payment,
      message: 'Payment recorded successfully'
    });
  } catch (error) {
    logger.error('Error recording payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record payment',
      error: error.message
    });
  }
};

/**
 * @desc    Create shipment for order
 * @route   POST /api/orders/:id/shipments
 * @access  Private
 */
exports.createShipment = async (req, res, next) => {
  try {
    const { carrier, trackingNumber, items, notes } = req.body;
    const order = await Order.findByPk(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    if (order.status !== 'processing') {
      return res.status(400).json({
        success: false,
        message: 'Order must be in processing status to create shipment'
      });
    }
    
    const shipment = await OrderShipment.create({
      orderId: order.id,
      carrier,
      trackingNumber,
      items: items || order.items,
      notes,
      status: 'in_transit'
    });
    
    res.status(201).json({
      success: true,
      data: shipment,
      message: 'Shipment created successfully'
    });
  } catch (error) {
    logger.error('Error creating shipment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create shipment',
      error: error.message
    });
  }
};

/**
 * @desc    Get order statistics
 * @route   GET /api/orders/statistics
 * @access  Private
 */
exports.getStatistics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const where = {};
    
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    
    const stats = await Order.findAll({
      where,
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
        [require('sequelize').fn('SUM', require('sequelize').col('totalAmount')), 'total']
      ],
      group: ['status']
    });
    
    const totalOrders = await Order.count({ where });
    const totalRevenue = await Order.sum('totalAmount', { 
      where: { ...where, status: { [Op.notIn]: ['cancelled'] } }
    });
    
    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        totalRevenue: totalRevenue || 0,
        byStatus: stats
      }
    });
  } catch (error) {
    logger.error('Error fetching order statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};
