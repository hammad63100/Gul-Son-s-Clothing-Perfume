const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const accountingController = require('../controllers/accountingController');

// Middleware to check accounting permissions
const checkAccountingPermission = (action) => authorize(`accounting.${action}`);

/**
 * @route   GET /api/accounting/accounts
 * @desc    Get chart of accounts
 * @access  Private
 */
router.get('/accounts', 
  authenticate, 
  checkAccountingPermission('view_accounts'),
  accountingController.getAccounts
);

/**
 * @route   POST /api/accounting/accounts
 * @desc    Create a new account
 * @access  Private
 */
router.post('/accounts', 
  authenticate, 
  checkAccountingPermission('manage_accounts'),
  accountingController.createAccount
);

/**
 * @route   POST /api/accounting/journal-entries
 * @desc    Create a journal entry
 * @access  Private
 */
router.post('/journal-entries', 
  authenticate, 
  checkAccountingPermission('create_journal_entries'),
  accountingController.createJournalEntry
);

/**
 * @route   POST /api/accounting/journal-entries/:id/post
 * @desc    Post a journal entry
 * @access  Private
 */
router.post('/journal-entries/:id/post', 
  authenticate, 
  checkAccountingPermission('post_journal_entries'),
  accountingController.postJournalEntry
);

/**
 * @route   GET /api/accounting/invoices
 * @desc    Get all invoices
 * @access  Private
 */
router.get('/invoices', 
  authenticate, 
  checkAccountingPermission('view_invoices'),
  accountingController.getInvoices
);

/**
 * @route   POST /api/accounting/invoices
 * @desc    Create a new invoice
 * @access  Private
 */
router.post('/invoices', 
  authenticate, 
  checkAccountingPermission('create_invoices'),
  accountingController.createInvoice
);

/**
 * @route   POST /api/accounting/invoices/:id/payments
 * @desc    Record invoice payment
 * @access  Private
 */
router.post('/invoices/:id/payments', 
  authenticate, 
  checkAccountingPermission('record_payments'),
  accountingController.recordInvoicePayment
);

/**
 * @route   GET /api/accounting/tax-rates
 * @desc    Get tax rates
 * @access  Private
 */
router.get('/tax-rates', 
  authenticate, 
  checkAccountingPermission('view_tax_rates'),
  accountingController.getTaxRates
);

/**
 * @route   GET /api/accounting/reports/:type
 * @desc    Get financial reports (trial-balance, profit-loss)
 * @access  Private
 */
router.get('/reports/:type', 
  authenticate, 
  checkAccountingPermission('view_reports'),
  accountingController.getFinancialReport
);

module.exports = router;
