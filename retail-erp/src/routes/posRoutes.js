const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const posController = require('../controllers/posController');

// Middleware to check POS permissions
const checkPosPermission = (action) => authorize(`pos.${action}`);

/**
 * @route   POST /api/pos/sessions
 * @desc    Open a new POS session
 * @access  Private (POS User)
 */
router.post('/sessions', 
  authenticate, 
  checkPosPermission('open_session'),
  posController.createSession
);

/**
 * @route   GET /api/pos/sessions
 * @desc    Get all POS sessions
 * @access  Private (Manager)
 */
router.get('/sessions', 
  authenticate, 
  checkPosPermission('view_sessions'),
  posController.getSessions
);

/**
 * @route   GET /api/pos/sessions/:id
 * @desc    Get a single POS session with transactions
 * @access  Private
 */
router.get('/sessions/:id', 
  authenticate, 
  checkPosPermission('view_sessions'),
  posController.getSession
);

/**
 * @route   POST /api/pos/sessions/:id/close
 * @desc    Close a POS session
 * @access  Private (POS User)
 */
router.post('/sessions/:id/close', 
  authenticate, 
  checkPosPermission('close_session'),
  posController.closeSession
);

/**
 * @route   GET /api/pos/sessions/:sessionId/transactions
 * @desc    Get all transactions for a session
 * @access  Private
 */
router.get('/sessions/:sessionId/transactions', 
  authenticate, 
  checkPosPermission('view_transactions'),
  posController.getSessionTransactions
);

/**
 * @route   POST /api/pos/transactions
 * @desc    Process a new POS transaction
 * @access  Private (POS User)
 */
router.post('/transactions', 
  authenticate, 
  checkPosPermission('process_transaction'),
  posController.createTransaction
);

/**
 * @route   GET /api/pos/dashboard
 * @desc    Get POS dashboard statistics
 * @access  Private (Manager)
 */
router.get('/dashboard', 
  authenticate, 
  checkPosPermission('view_dashboard'),
  posController.getDashboard
);

module.exports = router;
