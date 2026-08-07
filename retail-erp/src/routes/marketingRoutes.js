const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const marketingController = require('../controllers/marketingController');

// Middleware to check marketing permissions
const checkMarketingPermission = (action) => authorize(`marketing.${action}`);

/**
 * @route   GET /api/marketing/campaigns
 * @desc    Get all marketing campaigns
 * @access  Private
 */
router.get('/campaigns', 
  authenticate, 
  checkMarketingPermission('view_campaigns'),
  marketingController.getCampaigns
);

/**
 * @route   POST /api/marketing/campaigns
 * @desc    Create a new campaign
 * @access  Private
 */
router.post('/campaigns', 
  authenticate, 
  checkMarketingPermission('create_campaigns'),
  marketingController.createCampaign
);

/**
 * @route   GET /api/marketing/promotions
 * @desc    Get all promotions
 * @access  Private
 */
router.get('/promotions', 
  authenticate, 
  checkMarketingPermission('view_promotions'),
  marketingController.getPromotions
);

/**
 * @route   POST /api/marketing/promotions
 * @desc    Create a new promotion
 * @access  Private
 */
router.post('/promotions', 
  authenticate, 
  checkMarketingPermission('create_promotions'),
  marketingController.createPromotion
);

/**
 * @route   POST /api/marketing/promotions/validate
 * @desc    Validate and apply promotion code
 * @access  Public
 */
router.post('/promotions/validate', 
  marketingController.validatePromotion
);

/**
 * @route   GET /api/marketing/loyalty
 * @desc    Get all loyalty programs
 * @access  Private
 */
router.get('/loyalty', 
  authenticate, 
  checkMarketingPermission('view_loyalty'),
  marketingController.getLoyaltyPrograms
);

/**
 * @route   POST /api/marketing/loyalty
 * @desc    Create a new loyalty program
 * @access  Private
 */
router.post('/loyalty', 
  authenticate, 
  checkMarketingPermission('create_loyalty'),
  marketingController.createLoyaltyProgram
);

/**
 * @route   POST /api/marketing/loyalty/award
 * @desc    Award loyalty points to customer
 * @access  Private
 */
router.post('/loyalty/award', 
  authenticate, 
  checkMarketingPermission('manage_loyalty'),
  marketingController.awardPoints
);

/**
 * @route   POST /api/marketing/loyalty/redeem
 * @desc    Redeem loyalty points
 * @access  Private
 */
router.post('/loyalty/redeem', 
  authenticate, 
  checkMarketingPermission('manage_loyalty'),
  marketingController.redeemPoints
);

/**
 * @route   GET /api/marketing/loyalty/customer/:customerId
 * @desc    Get customer loyalty summary
 * @access  Private
 */
router.get('/loyalty/customer/:customerId', 
  authenticate, 
  checkMarketingPermission('view_loyalty'),
  marketingController.getCustomerLoyalty
);

module.exports = router;
