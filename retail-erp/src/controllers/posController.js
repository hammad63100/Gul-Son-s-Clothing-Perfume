const { POSTransaction, POSession, Product, ProductVariant, Inventory, Customer, User } = require('../models');
const logger = require('../config/logger');
const { Op } = require('sequelize');

/**
 * @desc    Get all POS sessions
 * @route   GET /api/pos/sessions
 * @access  Private
 */
exports.getSessions = async (req, res, next) => {
  try {
    const { status, userId, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;
    
    const { count, rows } = await POSession.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'firstName', 'lastName']
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
    logger.error('Error fetching POS sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch POS sessions',
      error: error.message
    });
  }
};

/**
 * @desc    Create a new POS session
 * @route   POST /api/pos/sessions
 * @access  Private
 */
exports.createSession = async (req, res, next) => {
  try {
    const { openingCash, notes } = req.body;
    const userId = req.user.id;
    
    // Check if user already has an open session
    const existingOpenSession = await POSession.findOne({
      where: { userId, status: 'open' }
    });
    
    if (existingOpenSession) {
      return res.status(400).json({
        success: false,
        message: 'You already have an open POS session. Please close it first.'
      });
    }
    
    const session = await POSession.create({
      userId,
      openingCash: parseFloat(openingCash) || 0,
      notes,
      status: 'open'
    });
    
    res.status(201).json({
      success: true,
      data: session,
      message: 'POS session opened successfully'
    });
  } catch (error) {
    logger.error('Error creating POS session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create POS session',
      error: error.message
    });
  }
};

/**
 * @desc    Get a single POS session
 * @route   GET /api/pos/sessions/:id
 * @access  Private
 */
exports.getSession = async (req, res, next) => {
  try {
    const session = await POSession.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'firstName', 'lastName']
        },
        {
          model: POSTransaction,
          as: 'transactions',
          include: [
            { model: Product, as: 'product' },
            { model: ProductVariant, as: 'variant' },
            { model: Customer, as: 'customer' }
          ]
        }
      ]
    });
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'POS session not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    logger.error('Error fetching POS session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch POS session',
      error: error.message
    });
  }
};

/**
 * @desc    Close a POS session
 * @route   POST /api/pos/sessions/:id/close
 * @access  Private
 */
exports.closeSession = async (req, res, next) => {
  try {
    const { closingCash, notes } = req.body;
    const session = await POSession.findByPk(req.params.id);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'POS session not found'
      });
    }
    
    if (session.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'Session is not open'
      });
    }
    
    // Calculate expected cash
    const transactions = await POSTransaction.findAll({
      where: { sessionId: session.id }
    });
    
    const totalSales = transactions.reduce((sum, t) => sum + parseFloat(t.totalAmount), 0);
    const expectedCash = parseFloat(session.openingCash) + totalSales;
    const difference = parseFloat(closingCash) - expectedCash;
    
    await session.update({
      closingCash: parseFloat(closingCash),
      status: 'closed',
      notes: notes ? `${session.notes || ''}\n${notes}` : session.notes,
      discrepancy: difference
    });
    
    res.status(200).json({
      success: true,
      data: session,
      message: 'POS session closed successfully',
      summary: {
        openingCash: session.openingCash,
        totalSales,
        expectedCash,
        closingCash: parseFloat(closingCash),
        difference
      }
    });
  } catch (error) {
    logger.error('Error closing POS session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to close POS session',
      error: error.message
    });
  }
};

/**
 * @desc    Process a POS transaction
 * @route   POST /api/pos/transactions
 * @access  Private
 */
exports.createTransaction = async (req, res, next) => {
  try {
    const { sessionId, items, customerId, paymentMethod, paymentReference, discount = 0, notes } = req.body;
    
    // Validate session
    const session = await POSession.findByPk(sessionId);
    if (!session || session.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'Invalid or closed POS session'
      });
    }
    
    // Calculate totals
    let subtotal = 0;
    const processedItems = [];
    
    for (const item of items) {
      const { productId, variantId, quantity, price } = item;
      
      const product = await Product.findByPk(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${productId} not found`
        });
      }
      
      // Check inventory if variant specified
      if (variantId) {
        const variant = await ProductVariant.findByPk(variantId);
        if (!variant) {
          return res.status(404).json({
            success: false,
            message: `Variant ${variantId} not found`
          });
        }
        
        const inventory = await Inventory.findOne({
          where: { productId, variantId, warehouseId: session.warehouseId }
        });
        
        if (!inventory || inventory.quantity < quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${product.name}`
          });
        }
        
        // Update inventory
        await inventory.decrement('quantity', { by: quantity });
        await inventory.increment('reservedQuantity', { by: 0 }); // Reset any reservations
        
        // Create stock movement
        const { StockMovement } = require('../models');
        await StockMovement.create({
          productId,
          variantId,
          warehouseId: session.warehouseId,
          type: 'sale',
          quantity: -quantity,
          referenceType: 'pos_transaction',
          referenceId: null, // Will update after transaction creation
          notes: `POS Sale - Session ${sessionId}`
        });
      }
      
      const itemTotal = parseFloat(price) * parseInt(quantity);
      subtotal += itemTotal;
      processedItems.push({ ...item, total: itemTotal });
    }
    
    const totalAmount = subtotal - parseFloat(discount);
    
    // Create transaction
    const transaction = await POSTransaction.create({
      sessionId,
      customerId,
      items: processedItems,
      subtotal,
      discount: parseFloat(discount),
      totalAmount,
      paymentMethod,
      paymentReference,
      notes,
      status: 'completed'
    });
    
    res.status(201).json({
      success: true,
      data: transaction,
      message: 'Transaction completed successfully'
    });
  } catch (error) {
    logger.error('Error processing POS transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process transaction',
      error: error.message
    });
  }
};

/**
 * @desc    Get transactions for a session
 * @route   GET /api/pos/sessions/:sessionId/transactions
 * @access  Private
 */
exports.getSessionTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    const { count, rows } = await POSTransaction.findAndCountAll({
      where: { sessionId: req.params.sessionId },
      include: [
        { model: Product, as: 'product' },
        { model: ProductVariant, as: 'variant' },
        { model: Customer, as: 'customer' }
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
    logger.error('Error fetching POS transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions',
      error: error.message
    });
  }
};

/**
 * @desc    Get POS dashboard statistics
 * @route   GET /api/pos/dashboard
 * @access  Private
 */
exports.getDashboard = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const where = { status: 'completed' };
    
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    
    const transactions = await POSTransaction.findAll({
      where,
      attributes: [
        'totalAmount',
        'paymentMethod',
        [require('sequelize').fn('DATE', require('sequelize').col('createdAt')), 'date']
      ]
    });
    
    const totalSales = transactions.reduce((sum, t) => sum + parseFloat(t.totalAmount), 0);
    const transactionCount = transactions.length;
    
    const salesByPayment = {};
    const salesByDate = {};
    
    transactions.forEach(t => {
      const method = t.paymentMethod;
      const date = t.dataValues.date;
      
      salesByPayment[method] = (salesByPayment[method] || 0) + parseFloat(t.totalAmount);
      salesByDate[date] = (salesByDate[date] || 0) + parseFloat(t.totalAmount);
    });
    
    res.status(200).json({
      success: true,
      data: {
        totalSales,
        transactionCount,
        averageTransaction: transactionCount > 0 ? totalSales / transactionCount : 0,
        salesByPayment,
        salesByDate
      }
    });
  } catch (error) {
    logger.error('Error fetching POS dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
};
