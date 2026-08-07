const { Report, ReportSnapshot, Order, Product, Customer, User, POSTransaction } = require('../models');
const logger = require('../config/logger');
const { Op, fn, col, literal } = require('sequelize');

/**
 * @desc    Get all reports
 * @route   GET /api/reports
 * @access  Private
 */
exports.getReports = async (req, res, next) => {
  try {
    const { type, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    if (type) where.type = type;
    
    const { count, rows } = await Report.findAndCountAll({
      where,
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
    logger.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports',
      error: error.message
    });
  }
};

/**
 * @desc    Create a new report definition
 * @route   POST /api/reports
 * @access  Private
 */
exports.createReport = async (req, res, next) => {
  try {
    const { name, type, description, config, schedule } = req.body;
    
    const report = await Report.create({
      name,
      type,
      description,
      config: config || {},
      schedule: schedule || null,
      isActive: true
    });
    
    res.status(201).json({
      success: true,
      data: report,
      message: 'Report created successfully'
    });
  } catch (error) {
    logger.error('Error creating report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create report',
      error: error.message
    });
  }
};

/**
 * @desc    Generate sales report
 * @route   GET /api/reports/sales
 * @access  Private
 */
exports.generateSalesReport = async (req, res, next) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    const where = { status: { [Op.notIn]: ['cancelled'] } };
    if (startDate && endDate) {
      where.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    }
    
    // Group by time period
    let dateFormat;
    switch (groupBy) {
      case 'month':
        dateFormat = 'YYYY-MM';
        break;
      case 'week':
        dateFormat = 'IYYY-IW';
        break;
      default:
        dateFormat = 'YYYY-MM-DD';
    }
    
    const salesData = await Order.findAll({
      where,
      attributes: [
        [fn('TO_CHAR', col('createdAt'), dateFormat), 'period'],
        [fn('COUNT', col('id')), 'orderCount'],
        [fn('SUM', col('totalAmount')), 'totalRevenue'],
        [fn('AVG', col('totalAmount')), 'averageOrderValue']
      ],
      group: [literal('period')],
      order: [literal('period')]
    });
    
    res.status(200).json({
      success: true,
      data: {
        type: 'sales',
        groupBy,
        period: { startDate, endDate },
        summary: salesData
      },
      message: 'Sales report generated successfully'
    });
  } catch (error) {
    logger.error('Error generating sales report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate sales report',
      error: error.message
    });
  }
};

/**
 * @desc    Generate inventory report
 * @route   GET /api/reports/inventory
 * @access  Private
 */
exports.generateInventoryReport = async (req, res, next) => {
  try {
    const { warehouseId, lowStockThreshold = 10 } = req.query;
    
    const { Inventory, Product, Warehouse } = require('../models');
    
    const where = {};
    if (warehouseId) where.warehouseId = warehouseId;
    
    const inventoryItems = await Inventory.findAll({
      where,
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name', 'sku'] },
        { model: Warehouse, as: 'warehouse', attributes: ['id', 'name', 'code'] }
      ],
      order: [['quantity', 'ASC']]
    });
    
    // Identify low stock items
    const lowStockItems = inventoryItems.filter(item => item.quantity <= lowStockThreshold);
    const outOfStockItems = inventoryItems.filter(item => item.quantity === 0);
    
    // Calculate total inventory value
    const totalValue = inventoryItems.reduce((sum, item) => {
      return sum + (item.quantity * parseFloat(item.product?.price || 0));
    }, 0);
    
    res.status(200).json({
      success: true,
      data: {
        type: 'inventory',
        summary: {
          totalItems: inventoryItems.length,
          totalValue,
          lowStockCount: lowStockItems.length,
          outOfStockCount: outOfStockItems.length
        },
        lowStockItems,
        outOfStockItems
      },
      message: 'Inventory report generated successfully'
    });
  } catch (error) {
    logger.error('Error generating inventory report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate inventory report',
      error: error.message
    });
  }
};

/**
 * @desc    Generate customer report
 * @route   GET /api/reports/customers
 * @access  Private
 */
exports.generateCustomerReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const { Order } = require('../models');
    
    const where = {};
    if (startDate && endDate) {
      where.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    }
    
    const customerStats = await Order.findAll({
      where,
      attributes: [
        'customerId',
        [fn('COUNT', col('id')), 'orderCount'],
        [fn('SUM', col('totalAmount')), 'totalSpent'],
        [fn('MAX', col('createdAt')), 'lastOrderDate']
      ],
      group: ['customerId'],
      order: [[fn('SUM', col('totalAmount')), 'DESC']]
    });
    
    // Get customer details
    const customers = await Promise.all(customerStats.map(async stat => {
      const customer = await Customer.findByPk(stat.customerId, {
        attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
      });
      return {
        ...stat.dataValues,
        customer
      };
    }));
    
    res.status(200).json({
      success: true,
      data: {
        type: 'customers',
        period: { startDate, endDate },
        topCustomers: customers.slice(0, 20),
        totalCustomers: customers.length
      },
      message: 'Customer report generated successfully'
    });
  } catch (error) {
    logger.error('Error generating customer report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate customer report',
      error: error.message
    });
  }
};

/**
 * @desc    Generate POS report
 * @route   GET /api/reports/pos
 * @access  Private
 */
exports.generatePOSReport = async (req, res, next) => {
  try {
    const { startDate, endDate, userId } = req.query;
    
    const where = { status: 'completed' };
    if (startDate && endDate) {
      where.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    }
    if (userId) where.userId = userId;
    
    const transactions = await POSTransaction.findAll({
      where,
      attributes: [
        'sessionId',
        'paymentMethod',
        [fn('DATE', col('createdAt')), 'date'],
        [fn('COUNT', col('id')), 'transactionCount'],
        [fn('SUM', col('totalAmount')), 'totalAmount']
      ],
      group: ['sessionId', 'paymentMethod', literal('date')],
      order: [literal('date')]
    });
    
    // Aggregate by payment method
    const byPaymentMethod = {};
    transactions.forEach(t => {
      const method = t.paymentMethod;
      if (!byPaymentMethod[method]) {
        byPaymentMethod[method] = { count: 0, total: 0 };
      }
      byPaymentMethod[method].count += parseInt(t.dataValues.transactionCount);
      byPaymentMethod[method].total += parseFloat(t.dataValues.totalAmount);
    });
    
    res.status(200).json({
      success: true,
      data: {
        type: 'pos',
        period: { startDate, endDate },
        byPaymentMethod,
        transactions
      },
      message: 'POS report generated successfully'
    });
  } catch (error) {
    logger.error('Error generating POS report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate POS report',
      error: error.message
    });
  }
};

/**
 * @desc    Save report snapshot
 * @route   POST /api/reports/:id/snapshots
 * @access  Private
 */
exports.saveSnapshot = async (req, res, next) => {
  try {
    const { data } = req.body;
    const report = await Report.findByPk(req.params.id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }
    
    const snapshot = await ReportSnapshot.create({
      reportId: report.id,
      data: data || {},
      generatedAt: new Date()
    });
    
    res.status(201).json({
      success: true,
      data: snapshot,
      message: 'Report snapshot saved successfully'
    });
  } catch (error) {
    logger.error('Error saving report snapshot:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save report snapshot',
      error: error.message
    });
  }
};

/**
 * @desc    Get dashboard metrics
 * @route   GET /api/reports/dashboard
 * @access  Private
 */
exports.getDashboardMetrics = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    // Get key metrics
    const totalOrders = await Order.count({
      where: { createdAt: { [Op.gte]: startDate } }
    });
    
    const totalRevenue = await Order.sum('totalAmount', {
      where: { 
        createdAt: { [Op.gte]: startDate },
        status: { [Op.notIn]: ['cancelled'] }
      }
    });
    
    const totalCustomers = await Customer.count();
    const totalProducts = await Product.count();
    
    // Recent orders
    const recentOrders = await Order.findAll({
      where: { createdAt: { [Op.gte]: startDate } },
      limit: 10,
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'orderNumber', 'totalAmount', 'status', 'createdAt']
    });
    
    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalOrders,
          totalRevenue: totalRevenue || 0,
          totalCustomers,
          totalProducts,
          averageOrderValue: totalOrders > 0 ? (totalRevenue || 0) / totalOrders : 0
        },
        recentOrders
      },
      message: 'Dashboard metrics retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching dashboard metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard metrics',
      error: error.message
    });
  }
};
