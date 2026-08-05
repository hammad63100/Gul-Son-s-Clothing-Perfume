const bcrypt = require('bcryptjs');

module.exports = {
  hashPassword: async (password) => {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    return await bcrypt.hash(password, saltRounds);
  },

  comparePassword: async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
  },

  generateSKU: (categoryCode, brandCode, variantData) => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${categoryCode}-${brandCode}-${variantData}-${timestamp}${random}`;
  },

  generateOrderNumber: () => {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD-${year}${month}${day}-${random}`;
  },

  generateInvoiceNumber: () => {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `INV-${year}${month}-${random}`;
  },

  sanitizeInput: (input) => {
    if (typeof input !== 'string') return input;
    return input.trim().replace(/[<>]/g, '');
  },

  calculateDiscount: (price, discountType, discountValue) => {
    if (discountType === 'percentage') {
      return price - (price * discountValue / 100);
    } else if (discountType === 'fixed') {
      return Math.max(0, price - discountValue);
    }
    return price;
  },

  calculateTax: (amount, taxRate) => {
    return amount * (taxRate / 100);
  },

  formatCurrency: (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }
};
