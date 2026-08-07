const { Account, JournalEntry, JournalEntryLine, Invoice, InvoiceItem, InvoicePayment, TaxRate, User } = require('../models');
const logger = require('../config/logger');
const { Op } = require('sequelize');

/**
 * @desc    Get all accounts (Chart of Accounts)
 * @route   GET /api/accounting/accounts
 * @access  Private
 */
exports.getAccounts = async (req, res, next) => {
  try {
    const { type, parentAccountId, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    if (type) where.type = type;
    if (parentAccountId) where.parentAccountId = parentAccountId;
    
    const accounts = await Account.findAll({
      where,
      include: [
        {
          model: Account,
          as: 'parent',
          attributes: ['id', 'code', 'name']
        }
      ],
      order: [['code', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      data: accounts,
      message: 'Accounts retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching accounts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch accounts',
      error: error.message
    });
  }
};

/**
 * @desc    Create a new account
 * @route   POST /api/accounting/accounts
 * @access  Private
 */
exports.createAccount = async (req, res, next) => {
  try {
    const { code, name, type, parentAccountId, description, currency = 'USD' } = req.body;
    
    // Check if code already exists
    const existing = await Account.findOne({ where: { code } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Account code already exists'
      });
    }
    
    const account = await Account.create({
      code,
      name,
      type,
      parentAccountId,
      description,
      currency,
      balance: 0,
      isActive: true
    });
    
    res.status(201).json({
      success: true,
      data: account,
      message: 'Account created successfully'
    });
  } catch (error) {
    logger.error('Error creating account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create account',
      error: error.message
    });
  }
};

/**
 * @desc    Create a journal entry
 * @route   POST /api/accounting/journal-entries
 * @access  Private
 */
exports.createJournalEntry = async (req, res, next) => {
  try {
    const { date, description, reference, lines, createdBy } = req.body;
    
    // Validate that debits equal credits
    let totalDebit = 0;
    let totalCredit = 0;
    
    for (const line of lines) {
      if (line.debit) totalDebit += parseFloat(line.debit);
      if (line.credit) totalCredit += parseFloat(line.credit);
    }
    
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return res.status(400).json({
        success: false,
        message: `Journal entry must balance. Debits: ${totalDebit}, Credits: ${totalCredit}`
      });
    }
    
    // Create journal entry with lines
    const journalEntry = await JournalEntry.create({
      date: new Date(date),
      description,
      reference,
      postedBy: createdBy || req.user?.id,
      status: 'draft'
    });
    
    // Create journal entry lines
    const journalLines = lines.map(line => ({
      journalEntryId: journalEntry.id,
      accountId: line.accountId,
      debit: parseFloat(line.debit) || 0,
      credit: parseFloat(line.credit) || 0,
      description: line.description
    }));
    
    await JournalEntryLine.bulkCreate(journalLines);
    
    // Post the entry if requested
    if (req.body.post === true) {
      await exports.postJournalEntry({ params: { id: journalEntry.id } }, res, next);
    }
    
    res.status(201).json({
      success: true,
      data: journalEntry,
      message: 'Journal entry created successfully'
    });
  } catch (error) {
    logger.error('Error creating journal entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create journal entry',
      error: error.message
    });
  }
};

/**
 * @desc    Post a journal entry
 * @route   POST /api/accounting/journal-entries/:id/post
 * @access  Private
 */
exports.postJournalEntry = async (req, res, next) => {
  try {
    const journalEntry = await JournalEntry.findByPk(req.params.id, {
      include: [{ model: JournalEntryLine, as: 'lines' }]
    });
    
    if (!journalEntry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }
    
    if (journalEntry.status === 'posted') {
      return res.status(400).json({
        success: false,
        message: 'Journal entry is already posted'
      });
    }
    
    // Update account balances
    for (const line of journalEntry.lines) {
      const account = await Account.findByPk(line.accountId);
      if (account) {
        let newBalance = parseFloat(account.balance || 0);
        
        // Adjust balance based on account type and debit/credit
        if (['asset', 'expense'].includes(account.type)) {
          newBalance += (parseFloat(line.debit) || 0) - (parseFloat(line.credit) || 0);
        } else {
          newBalance += (parseFloat(line.credit) || 0) - (parseFloat(line.debit) || 0);
        }
        
        await account.update({ balance: newBalance });
      }
    }
    
    await journalEntry.update({ status: 'posted', postedAt: new Date() });
    
    res.status(200).json({
      success: true,
      data: journalEntry,
      message: 'Journal entry posted successfully'
    });
  } catch (error) {
    logger.error('Error posting journal entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to post journal entry',
      error: error.message
    });
  }
};

/**
 * @desc    Get all invoices
 * @route   GET /api/accounting/invoices
 * @access  Private
 */
exports.getInvoices = async (req, res, next) => {
  try {
    const { status, customerId, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;
    
    const { count, rows } = await Invoice.findAndCountAll({
      where,
      include: [
        {
          model: InvoiceItem,
          as: 'items'
        },
        {
          model: InvoicePayment,
          as: 'payments'
        }
      ],
      order: [['dueDate', 'ASC']],
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
    logger.error('Error fetching invoices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoices',
      error: error.message
    });
  }
};

/**
 * @desc    Create a new invoice
 * @route   POST /api/accounting/invoices
 * @access  Private
 */
exports.createInvoice = async (req, res, next) => {
  try {
    const { 
      customerId, 
      invoiceNumber, 
      items, 
      taxRateId, 
      dueDate, 
      notes 
    } = req.body;
    
    // Calculate totals
    let subtotal = 0;
    const processedItems = [];
    
    for (const item of items) {
      const itemTotal = parseFloat(item.price) * parseInt(item.quantity);
      subtotal += itemTotal;
      processedItems.push({ ...item, total: itemTotal });
    }
    
    // Apply tax
    let taxAmount = 0;
    if (taxRateId) {
      const taxRate = await TaxRate.findByPk(taxRateId);
      if (taxRate) {
        taxAmount = subtotal * (parseFloat(taxRate.rate) / 100);
      }
    }
    
    const totalAmount = subtotal + taxAmount;
    
    const invoice = await Invoice.create({
      invoiceNumber: invoiceNumber || `INV-${Date.now()}`,
      customerId,
      items: processedItems,
      subtotal,
      taxAmount,
      totalAmount,
      amountPaid: 0,
      amountDue: totalAmount,
      dueDate: new Date(dueDate),
      notes,
      status: 'pending'
    });
    
    res.status(201).json({
      success: true,
      data: invoice,
      message: 'Invoice created successfully'
    });
  } catch (error) {
    logger.error('Error creating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create invoice',
      error: error.message
    });
  }
};

/**
 * @desc    Record invoice payment
 * @route   POST /api/accounting/invoices/:id/payments
 * @access  Private
 */
exports.recordInvoicePayment = async (req, res, next) => {
  try {
    const { amount, paymentMethod, paymentReference, notes } = req.body;
    const invoice = await Invoice.findByPk(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    
    const payment = await InvoicePayment.create({
      invoiceId: invoice.id,
      amount: parseFloat(amount),
      paymentMethod,
      paymentReference,
      notes,
      status: 'completed'
    });
    
    // Update invoice amounts
    const newAmountPaid = parseFloat(invoice.amountPaid) + parseFloat(amount);
    const newAmountDue = parseFloat(invoice.amountDue) - parseFloat(amount);
    
    let newStatus = invoice.status;
    if (newAmountDue <= 0.01) {
      newStatus = 'paid';
    } else if (newAmountPaid > 0) {
      newStatus = 'partial';
    }
    
    await invoice.update({
      amountPaid: newAmountPaid,
      amountDue: newAmountDue,
      status: newStatus
    });
    
    res.status(201).json({
      success: true,
      data: payment,
      message: 'Payment recorded successfully'
    });
  } catch (error) {
    logger.error('Error recording invoice payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record payment',
      error: error.message
    });
  }
};

/**
 * @desc    Get all tax rates
 * @route   GET /api/accounting/tax-rates
 * @access  Private
 */
exports.getTaxRates = async (req, res, next) => {
  try {
    const taxRates = await TaxRate.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      data: taxRates,
      message: 'Tax rates retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching tax rates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tax rates',
      error: error.message
    });
  }
};

/**
 * @desc    Get financial reports
 * @route   GET /api/accounting/reports/:type
 * @access  Private
 */
exports.getFinancialReport = async (req, res, next) => {
  try {
    const { type } = req.params;
    const { startDate, endDate } = req.query;
    
    const where = {};
    if (startDate && endDate) {
      where.date = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    
    let report = {};
    
    if (type === 'trial-balance') {
      const accounts = await Account.findAll({
        include: [{
          model: JournalEntryLine,
          as: 'journalLines',
          include: [{
            model: JournalEntry,
            as: 'journalEntry',
            where: { status: 'posted' },
            required: true
          }]
        }]
      });
      
      report = {
        type: 'Trial Balance',
        accounts: accounts.map(acc => ({
          code: acc.code,
          name: acc.name,
          type: acc.type,
          balance: acc.balance
        }))
      };
    } else if (type === 'profit-loss') {
      // Simplified P&L calculation
      const incomeAccounts = await Account.findAll({ where: { type: 'income' } });
      const expenseAccounts = await Account.findAll({ where: { type: 'expense' } });
      
      const totalIncome = incomeAccounts.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0);
      const totalExpenses = expenseAccounts.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0);
      
      report = {
        type: 'Profit & Loss',
        income: totalIncome,
        expenses: totalExpenses,
        netIncome: totalIncome - totalExpenses
      };
    }
    
    res.status(200).json({
      success: true,
      data: report,
      message: 'Financial report generated successfully'
    });
  } catch (error) {
    logger.error('Error generating financial report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate financial report',
      error: error.message
    });
  }
};
