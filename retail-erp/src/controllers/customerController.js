const {
  Customer,
  CustomerAddress,
  CustomerInteraction,
  CustomerSegment,
  Order,
  LoyaltyTransaction
} = require('../models');
const { Op } = require('sequelize');

class CustomerController {
  // Get all customers with pagination and filters
  async getAllCustomers(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        customerType,
        isActive,
        minLoyaltyPoints,
        sortBy = 'createdAt',
        order = 'DESC'
      } = req.query;

      const offset = (page - 1) * limit;
      const where = {};

      if (search) {
        where[Op.or] = [
          { firstName: { [Op.iLike]: `%${search}%` } },
          { lastName: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
          { phone: { [Op.iLike]: `%${search}%` } }
        ];
      }

      if (customerType) where.customerType = customerType;
      if (isActive !== undefined) where.isActive = isActive === 'true';
      if (minLoyaltyPoints) where.loyaltyPoints = { [Op.gte]: minLoyaltyPoints };

      const { count, rows } = await Customer.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[sortBy, order]],
        include: [
          {
            model: CustomerAddress,
            as: 'addresses',
            attributes: ['id', 'addressType', 'city', 'state', 'country', 'isDefault']
          }
        ]
      });

      res.json({
        success: true,
        data: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching customers',
        error: error.message
      });
    }
  }

  // Get single customer by ID
  async getCustomerById(req, res) {
    try {
      const customer = await Customer.findByPk(req.params.id, {
        include: [
          {
            model: CustomerAddress,
            as: 'addresses'
          },
          {
            model: CustomerInteraction,
            as: 'interactions',
            limit: 10,
            order: [['createdAt', 'DESC']]
          },
          {
            model: Order,
            as: 'orders',
            limit: 10,
            order: [['createdAt', 'DESC']]
          }
        ]
      });

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      res.json({
        success: true,
        data: customer
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching customer',
        error: error.message
      });
    }
  }

  // Create new customer
  async createCustomer(req, res) {
    try {
      const customer = await Customer.create(req.body);

      res.status(201).json({
        success: true,
        data: customer
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error creating customer',
        error: error.message
      });
    }
  }

  // Update customer
  async updateCustomer(req, res) {
    try {
      const customer = await Customer.findByPk(req.params.id);

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      await customer.update(req.body);

      res.json({
        success: true,
        data: customer
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error updating customer',
        error: error.message
      });
    }
  }

  // Delete customer
  async deleteCustomer(req, res) {
    try {
      const customer = await Customer.findByPk(req.params.id);

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      // Soft delete by setting isActive to false
      await customer.update({ isActive: false });

      res.json({
        success: true,
        message: 'Customer deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting customer',
        error: error.message
      });
    }
  }

  // Add customer address
  async addAddress(req, res) {
    try {
      const { customerId } = req.params;
      const addressData = req.body;

      const customer = await Customer.findByPk(customerId);
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      // If this is set as default, unset other defaults
      if (addressData.isDefault) {
        await CustomerAddress.update(
          { isDefault: false },
          { where: { customerId } }
        );
      }

      const address = await CustomerAddress.create({
        ...addressData,
        customerId
      });

      res.status(201).json({
        success: true,
        data: address
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error adding address',
        error: error.message
      });
    }
  }

  // Log customer interaction
  async logInteraction(req, res) {
    try {
      const { customerId } = req.params;
      const interactionData = req.body;

      const customer = await Customer.findByPk(customerId);
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      const interaction = await CustomerInteraction.create({
        ...interactionData,
        customerId
      });

      res.status(201).json({
        success: true,
        data: interaction
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error logging interaction',
        error: error.message
      });
    }
  }

  // Get customer statistics
  async getCustomerStats(req, res) {
    try {
      const { customerId } = req.params;

      const customer = await Customer.findByPk(customerId);
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      const orderCount = await Order.count({ where: { customerId } });
      const interactionCount = await CustomerInteraction.count({ where: { customerId } });

      res.json({
        success: true,
        data: {
          customerId: customer.id,
          totalOrders: orderCount,
          totalInteractions: interactionCount,
          loyaltyPoints: customer.loyaltyPoints,
          totalPurchases: customer.totalPurchases,
          averageOrderValue: customer.averageOrderValue,
          lastPurchaseDate: customer.lastPurchaseDate
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching customer stats',
        error: error.message
      });
    }
  }

  // Search customers
  async searchCustomers(req, res) {
    try {
      const { q, limit = 10 } = req.query;

      if (!q || q.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Search query must be at least 2 characters'
        });
      }

      const customers = await Customer.findAll({
        where: {
          isActive: true,
          [Op.or]: [
            { firstName: { [Op.iLike]: `%${q}%` } },
            { lastName: { [Op.iLike]: `%${q}%` } },
            { email: { [Op.iLike]: `%${q}%` } },
            { phone: { [Op.iLike]: `%${q}%` } }
          ]
        },
        limit: parseInt(limit),
        attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'customerType']
      });

      res.json({
        success: true,
        data: customers
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error searching customers',
        error: error.message
      });
    }
  }
}

module.exports = new CustomerController();
