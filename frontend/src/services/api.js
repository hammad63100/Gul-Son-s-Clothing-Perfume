import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth Service
export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

// Product Service
export const productService = {
  getAll: async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  
  create: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },
  
  update: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
  
  getCategories: async () => {
    const response = await api.get('/products/categories');
    return response.data;
  },
};

// Inventory Service
export const inventoryService = {
  getAll: async (params = {}) => {
    const response = await api.get('/inventory', { params });
    return response.data;
  },
  
  getByProduct: async (productId) => {
    const response = await api.get(`/inventory/product/${productId}`);
    return response.data;
  },
  
  adjustStock: async (adjustmentData) => {
    const response = await api.post('/inventory/adjust', adjustmentData);
    return response.data;
  },
  
  getMovements: async (params = {}) => {
    const response = await api.get('/inventory/movements', { params });
    return response.data;
  },
  
  getWarehouses: async () => {
    const response = await api.get('/inventory/warehouses');
    return response.data;
  },
  
  createWarehouse: async (warehouseData) => {
    const response = await api.post('/inventory/warehouses', warehouseData);
    return response.data;
  },
  
  getSuppliers: async () => {
    const response = await api.get('/inventory/suppliers');
    return response.data;
  },
  
  createPurchaseOrder: async (orderData) => {
    const response = await api.post('/inventory/purchase-orders', orderData);
    return response.data;
  },
  
  getPurchaseOrders: async (params = {}) => {
    const response = await api.get('/inventory/purchase-orders', { params });
    return response.data;
  },
};

// Order Service
export const orderService = {
  getAll: async (params = {}) => {
    const response = await api.get('/orders', { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
  
  create: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },
  
  updateStatus: async (id, status) => {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
  },
  
  cancel: async (id) => {
    const response = await api.post(`/orders/${id}/cancel`);
    return response.data;
  },
};

// POS Service
export const posService = {
  createSession: async (sessionData) => {
    const response = await api.post('/pos/sessions', sessionData);
    return response.data;
  },
  
  closeSession: async (id) => {
    const response = await api.post(`/pos/sessions/${id}/close`);
    return response.data;
  },
  
  getSessions: async (params = {}) => {
    const response = await api.get('/pos/sessions', { params });
    return response.data;
  },
  
  createTransaction: async (transactionData) => {
    const response = await api.post('/pos/transactions', transactionData);
    return response.data;
  },
  
  getTransactions: async (sessionId) => {
    const response = await api.get(`/pos/sessions/${sessionId}/transactions`);
    return response.data;
  },
};

// Customer Service
export const customerService = {
  getAll: async (params = {}) => {
    const response = await api.get('/customers', { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },
  
  create: async (customerData) => {
    const response = await api.post('/customers', customerData);
    return response.data;
  },
  
  update: async (id, customerData) => {
    const response = await api.put(`/customers/${id}`, customerData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  },
  
  getSegments: async () => {
    const response = await api.get('/customers/segments');
    return response.data;
  },
  
  getInteractions: async (customerId) => {
    const response = await api.get(`/customers/${customerId}/interactions`);
    return response.data;
  },
  
  addInteraction: async (customerId, interactionData) => {
    const response = await api.post(`/customers/${customerId}/interactions`, interactionData);
    return response.data;
  },
};

// Marketing Service
export const marketingService = {
  getCampaigns: async (params = {}) => {
    const response = await api.get('/marketing/campaigns', { params });
    return response.data;
  },
  
  createCampaign: async (campaignData) => {
    const response = await api.post('/marketing/campaigns', campaignData);
    return response.data;
  },
  
  getPromotions: async (params = {}) => {
    const response = await api.get('/marketing/promotions', { params });
    return response.data;
  },
  
  createPromotion: async (promotionData) => {
    const response = await api.post('/marketing/promotions', promotionData);
    return response.data;
  },
  
  getLoyaltyPrograms: async () => {
    const response = await api.get('/marketing/loyalty-programs');
    return response.data;
  },
};

// Accounting Service
export const accountingService = {
  getAccounts: async (params = {}) => {
    const response = await api.get('/accounting/accounts', { params });
    return response.data;
  },
  
  createAccount: async (accountData) => {
    const response = await api.post('/accounting/accounts', accountData);
    return response.data;
  },
  
  getJournalEntries: async (params = {}) => {
    const response = await api.get('/accounting/journal-entries', { params });
    return response.data;
  },
  
  createJournalEntry: async (entryData) => {
    const response = await api.post('/accounting/journal-entries', entryData);
    return response.data;
  },
  
  getInvoices: async (params = {}) => {
    const response = await api.get('/accounting/invoices', { params });
    return response.data;
  },
  
  createInvoice: async (invoiceData) => {
    const response = await api.post('/accounting/invoices', invoiceData);
    return response.data;
  },
  
  getPayments: async (params = {}) => {
    const response = await api.get('/accounting/payments', { params });
    return response.data;
  },
  
  recordPayment: async (paymentData) => {
    const response = await api.post('/accounting/payments', paymentData);
    return response.data;
  },
};

// Reporting Service
export const reportingService = {
  getReports: async (params = {}) => {
    const response = await api.get('/reports', { params });
    return response.data;
  },
  
  generateReport: async (reportData) => {
    const response = await api.post('/reports/generate', reportData);
    return response.data;
  },
  
  getDashboard: async () => {
    const response = await api.get('/reports/dashboard');
    return response.data;
  },
};

// User Service
export const userService = {
  getAll: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  
  create: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },
  
  update: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
  
  getRoles: async () => {
    const response = await api.get('/users/roles');
    return response.data;
  },
};

export default api;
