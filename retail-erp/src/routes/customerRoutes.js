const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// Customer routes
router.get('/', customerController.getAllCustomers.bind(customerController));
router.get('/search', customerController.searchCustomers.bind(customerController));
router.get('/:id', customerController.getCustomerById.bind(customerController));
router.post('/', customerController.createCustomer.bind(customerController));
router.put('/:id', customerController.updateCustomer.bind(customerController));
router.delete('/:id', customerController.deleteCustomer.bind(customerController));

// Customer address routes
router.post('/:customerId/addresses', customerController.addAddress.bind(customerController));

// Customer interaction routes
router.post('/:customerId/interactions', customerController.logInteraction.bind(customerController));

// Customer statistics
router.get('/:customerId/stats', customerController.getCustomerStats.bind(customerController));

module.exports = router;
