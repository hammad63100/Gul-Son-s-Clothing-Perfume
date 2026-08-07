const { Campaign, Promotion, LoyaltyProgram, LoyaltyTransaction, Customer, CustomerSegment } = require('../models');
const logger = require('../config/logger');
const { Op } = require('sequelize');

/**
 * @desc    Get all marketing campaigns
 * @route   GET /api/marketing/campaigns
 * @access  Private
 */
exports.getCampaigns = async (req, res, next) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;
    
    const { count, rows } = await Campaign.findAndCountAll({
      where,
      include: [
        {
          model: CustomerSegment,
          as: 'targetSegment'
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
    logger.error('Error fetching campaigns:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch campaigns',
      error: error.message
    });
  }
};

/**
 * @desc    Create a new campaign
 * @route   POST /api/marketing/campaigns
 * @access  Private
 */
exports.createCampaign = async (req, res, next) => {
  try {
    const { name, description, type, targetSegmentId, startDate, endDate, budget, metrics } = req.body;
    
    const campaign = await Campaign.create({
      name,
      description,
      type,
      targetSegmentId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      budget: parseFloat(budget) || 0,
      metrics: metrics || {},
      status: 'draft'
    });
    
    res.status(201).json({
      success: true,
      data: campaign,
      message: 'Campaign created successfully'
    });
  } catch (error) {
    logger.error('Error creating campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create campaign',
      error: error.message
    });
  }
};

/**
 * @desc    Get all promotions
 * @route   GET /api/marketing/promotions
 * @access  Private
 */
exports.getPromotions = async (req, res, next) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;
    
    const { count, rows } = await Promotion.findAndCountAll({
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
    logger.error('Error fetching promotions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch promotions',
      error: error.message
    });
  }
};

/**
 * @desc    Create a new promotion
 * @route   POST /api/marketing/promotions
 * @access  Private
 */
exports.createPromotion = async (req, res, next) => {
  try {
    const { 
      name, 
      description, 
      type, 
      discountType, 
      discountValue, 
      minPurchaseAmount,
      maxDiscountAmount,
      startDate, 
      endDate,
      applicableProducts,
      applicableCategories,
      usageLimit,
      code
    } = req.body;
    
    const promotion = await Promotion.create({
      name,
      description,
      type,
      discountType,
      discountValue: parseFloat(discountValue) || 0,
      minPurchaseAmount: parseFloat(minPurchaseAmount) || 0,
      maxDiscountAmount: parseFloat(maxDiscountAmount) || null,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      applicableProducts: applicableProducts || [],
      applicableCategories: applicableCategories || [],
      usageLimit: parseInt(usageLimit) || null,
      usedCount: 0,
      code: code || null,
      isActive: true,
      status: 'draft'
    });
    
    res.status(201).json({
      success: true,
      data: promotion,
      message: 'Promotion created successfully'
    });
  } catch (error) {
    logger.error('Error creating promotion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create promotion',
      error: error.message
    });
  }
};

/**
 * @desc    Validate and apply promotion
 * @route   POST /api/marketing/promotions/validate
 * @access  Public
 */
exports.validatePromotion = async (req, res, next) => {
  try {
    const { code, cartTotal, productIds, categoryIds } = req.body;
    
    const promotion = await Promotion.findOne({
      where: { 
        code,
        status: 'active',
        isActive: true
      }
    });
    
    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired promotion code'
      });
    }
    
    // Check date range
    const now = new Date();
    if (now < promotion.startDate || now > promotion.endDate) {
      return res.status(400).json({
        success: false,
        message: 'Promotion is not valid at this time'
      });
    }
    
    // Check usage limit
    if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit) {
      return res.status(400).json({
        success: false,
        message: 'Promotion code has reached its usage limit'
      });
    }
    
    // Check minimum purchase
    if (promotion.minPurchaseAmount && cartTotal < promotion.minPurchaseAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum purchase amount of $${promotion.minPurchaseAmount} required`
      });
    }
    
    // Calculate discount
    let discountAmount = 0;
    if (promotion.discountType === 'percentage') {
      discountAmount = (cartTotal * promotion.discountValue) / 100;
      if (promotion.maxDiscountAmount) {
        discountAmount = Math.min(discountAmount, promotion.maxDiscountAmount);
      }
    } else if (promotion.discountType === 'fixed') {
      discountAmount = promotion.discountValue;
    }
    
    res.status(200).json({
      success: true,
      data: {
        promotion,
        discountAmount,
        finalTotal: cartTotal - discountAmount
      },
      message: 'Promotion validated successfully'
    });
  } catch (error) {
    logger.error('Error validating promotion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate promotion',
      error: error.message
    });
  }
};

/**
 * @desc    Get all loyalty programs
 * @route   GET /api/marketing/loyalty
 * @access  Private
 */
exports.getLoyaltyPrograms = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    if (status) where.status = status;
    
    const { count, rows } = await LoyaltyProgram.findAndCountAll({
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
    logger.error('Error fetching loyalty programs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch loyalty programs',
      error: error.message
    });
  }
};

/**
 * @desc    Create a new loyalty program
 * @route   POST /api/marketing/loyalty
 * @access  Private
 */
exports.createLoyaltyProgram = async (req, res, next) => {
  try {
    const { 
      name, 
      description, 
      pointsPerDollar, 
      redemptionRate,
      minPointsForRedemption,
      expirationMonths,
      tiers
    } = req.body;
    
    const program = await LoyaltyProgram.create({
      name,
      description,
      pointsPerDollar: parseFloat(pointsPerDollar) || 1,
      redemptionRate: parseFloat(redemptionRate) || 0.01,
      minPointsForRedemption: parseInt(minPointsForRedemption) || 100,
      expirationMonths: parseInt(expirationMonths) || 12,
      tiers: tiers || [],
      isActive: true,
      status: 'active'
    });
    
    res.status(201).json({
      success: true,
      data: program,
      message: 'Loyalty program created successfully'
    });
  } catch (error) {
    logger.error('Error creating loyalty program:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create loyalty program',
      error: error.message
    });
  }
};

/**
 * @desc    Award loyalty points to customer
 * @route   POST /api/marketing/loyalty/award
 * @access  Private
 */
exports.awardPoints = async (req, res, next) => {
  try {
    const { customerId, programId, points, reason, referenceType, referenceId } = req.body;
    
    const program = await LoyaltyProgram.findByPk(programId);
    if (!program || !program.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Active loyalty program not found'
      });
    }
    
    const transaction = await LoyaltyTransaction.create({
      customerId,
      programId,
      type: 'earn',
      points: parseInt(points),
      balanceAfter: 0, // Will be calculated
      reason,
      referenceType,
      referenceId,
      expiresAt: program.expirationMonths 
        ? new Date(Date.now() + program.expirationMonths * 30 * 24 * 60 * 60 * 1000)
        : null
    });
    
    // Update customer's total points (would need to add points field to Customer model)
    // For now, just return the transaction
    
    res.status(201).json({
      success: true,
      data: transaction,
      message: `Awarded ${points} points to customer`
    });
  } catch (error) {
    logger.error('Error awarding points:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to award points',
      error: error.message
    });
  }
};

/**
 * @desc    Redeem loyalty points
 * @route   POST /api/marketing/loyalty/redeem
 * @access  Private
 */
exports.redeemPoints = async (req, res, next) => {
  try {
    const { customerId, programId, points, redemptionValue, notes } = req.body;
    
    const program = await LoyaltyProgram.findByPk(programId);
    if (!program || !program.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Active loyalty program not found'
      });
    }
    
    if (points < program.minPointsForRedemption) {
      return res.status(400).json({
        success: false,
        message: `Minimum ${program.minPointsForRedemption} points required for redemption`
      });
    }
    
    const transaction = await LoyaltyTransaction.create({
      customerId,
      programId,
      type: 'redeem',
      points: -parseInt(points),
      balanceAfter: 0,
      redemptionValue: parseFloat(redemptionValue) || 0,
      notes,
      expiresAt: null
    });
    
    res.status(201).json({
      success: true,
      data: transaction,
      message: `Redeemed ${points} points`
    });
  } catch (error) {
    logger.error('Error redeeming points:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to redeem points',
      error: error.message
    });
  }
};

/**
 * @desc    Get customer loyalty summary
 * @route   GET /api/marketing/loyalty/customer/:customerId
 * @access  Private
 */
exports.getCustomerLoyalty = async (req, res, next) => {
  try {
    const transactions = await LoyaltyTransaction.findAll({
      where: { customerId: req.params.customerId },
      include: [
        {
          model: LoyaltyProgram,
          as: 'program'
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    // Calculate totals per program
    const summary = {};
    transactions.forEach(t => {
      const programId = t.programId;
      if (!summary[programId]) {
        summary[programId] = {
          program: t.program,
          totalEarned: 0,
          totalRedeemed: 0,
          currentBalance: 0,
          transactions: []
        };
      }
      
      if (t.type === 'earn') {
        summary[programId].totalEarned += t.points;
      } else {
        summary[programId].totalRedeemed += Math.abs(t.points);
      }
      
      summary[programId].transactions.push(t);
    });
    
    // Calculate current balances
    Object.keys(summary).forEach(programId => {
      summary[programId].currentBalance = summary[programId].totalEarned - summary[programId].totalRedeemed;
    });
    
    res.status(200).json({
      success: true,
      data: Object.values(summary),
      message: 'Loyalty summary retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching customer loyalty:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch loyalty summary',
      error: error.message
    });
  }
};
