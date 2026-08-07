# Retail ERP System - Frontend Setup Guide

## Overview
This guide explains how to set up the frontend for the Retail ERP System. The frontend is built as a separate React application that communicates with the backend API.

## Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Backend server running on http://localhost:3000

## Frontend Project Structure

Create a new React application in the `retail-erp` directory:

```bash
cd retail-erp
npx create-react-app client --template redux
cd client
```

## Install Dependencies

```bash
npm install axios react-router-dom @reduxjs/toolkit react-redux
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled
npm install recharts date-fns formik yup
npm install react-toastify
```

## Project Structure

```
retail-erp/
├── src/
│   ├── app.js                 # Backend Express app
│   ├── config/                # Database & logger config
│   ├── controllers/           # API controllers
│   ├── middleware/            # Express middleware
│   ├── models/                # Sequelize models
│   ├── routes/                # API routes
│   ├── services/              # Business logic services
│   └── utils/                 # Utility functions
└── client/                    # React frontend
    ├── public/
    ├── src/
    │   ├── components/        # Reusable UI components
    │   │   ├── common/        # Common components (Button, Input, etc.)
    │   │   ├── layout/        # Layout components (Header, Sidebar, etc.)
    │   │   └── index.js
    │   ├── pages/             # Page components
    │   │   ├── Dashboard/
    │   │   ├── Products/
    │   │   ├── Inventory/
    │   │   ├── Orders/
    │   │   ├── POS/
    │   │   ├── Customers/
    │   │   ├── Marketing/
    │   │   ├── Accounting/
    │   │   ├── Reports/
    │   │   └── Auth/
    │   ├── services/          # API service layer
    │   │   ├── api.js         # Axios configuration
    │   │   ├── authService.js
    │   │   ├── productService.js
    │   │   ├── inventoryService.js
    │   │   ├── orderService.js
    │   │   ├── posService.js
    │   │   ├── customerService.js
    │   │   ├── marketingService.js
    │   │   ├── accountingService.js
    │   │   └── reportService.js
    │   ├── store/             # Redux store
    │   │   ├── slices/        # Redux slices
    │   │   │   ├── authSlice.js
    │   │   │   ├── productSlice.js
    │   │   │   ├── inventorySlice.js
    │   │   │   ├── orderSlice.js
    │   │   │   └── ...
    │   │   └── index.js
    │   ├── utils/             # Helper functions
    │   ├── App.js
    │   └── index.js
    └── package.json
```

## Key Components to Implement

### 1. API Service Layer (`client/src/services/api.js`)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
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
  (error) => Promise.reject(error)
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

export default api;
```

### 2. Authentication Service (`client/src/services/authService.js`)

```javascript
import api from './api';

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem('user'));
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  }
};
```

### 3. Product Service (`client/src/services/productService.js`)

```javascript
import api from './api';

export const productService = {
  getAll: async (params) => {
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
  }
};
```

### 4. Dashboard Page Example (`client/src/pages/Dashboard/index.js`)

```javascript
import React, { useEffect, useState } from 'react';
import { reportService } from '../../services/reportService';
import { Card, Grid, Typography, Box } from '@mui/material';
import { LineChart, BarChart } from '../../components/charts';

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const data = await reportService.getDashboardMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2 }}>
            <Typography color="textSecondary">Total Orders</Typography>
            <Typography variant="h4">{metrics?.overview?.totalOrders}</Typography>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2 }}>
            <Typography color="textSecondary">Revenue</Typography>
            <Typography variant="h4">${metrics?.overview?.totalRevenue?.toFixed(2)}</Typography>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2 }}>
            <Typography color="textSecondary">Customers</Typography>
            <Typography variant="h4">{metrics?.overview?.totalCustomers}</Typography>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2 }}>
            <Typography color="textSecondary">Products</Typography>
            <Typography variant="h4">{metrics?.overview?.totalProducts}</Typography>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
```

### 5. POS Page Example (`client/src/pages/POS/index.js`)

```javascript
import React, { useState, useEffect } from 'react';
import { posService } from '../../services/posService';
import { productService } from '../../services/productService';
import { 
  Grid, Card, TextField, Button, Table, Typography, Box 
} from '@mui/material';

const POS = () => {
  const [session, setSession] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadActiveSession();
    loadProducts();
  }, []);

  const loadActiveSession = async () => {
    try {
      const sessions = await posService.getSessions({ status: 'open' });
      if (sessions.data.length > 0) {
        setSession(sessions.data[0]);
      } else {
        await openSession();
      }
    } catch (error) {
      console.error('Failed to load session:', error);
    }
  };

  const openSession = async () => {
    try {
      const newSession = await posService.openSession({ openingCash: 0 });
      setSession(newSession.data);
    } catch (error) {
      console.error('Failed to open session:', error);
    }
  };

  const loadProducts = async () => {
    const data = await productService.getAll();
    setProducts(data.data);
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
      setCart(cart.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { 
        productId: product.id, 
        name: product.name, 
        price: product.price, 
        quantity: 1 
      }]);
    }
  };

  const processTransaction = async () => {
    try {
      await posService.createTransaction({
        sessionId: session.id,
        items: cart,
        paymentMethod: 'cash',
        totalAmount: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      });
      setCart([]);
      alert('Transaction completed!');
    } catch (error) {
      alert('Transaction failed: ' + error.message);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Point of Sale</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={8}>
          <TextField
            fullWidth
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <Grid container spacing={2}>
            {products
              .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map(product => (
                <Grid item xs={3} key={product.id}>
                  <Card 
                    sx={{ p: 2, cursor: 'pointer' }}
                    onClick={() => addToCart(product)}
                  >
                    <Typography variant="subtitle1">{product.name}</Typography>
                    <Typography color="primary">${product.price}</Typography>
                  </Card>
                </Grid>
              ))}
          </Grid>
        </Grid>
        
        <Grid item xs={4}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Cart</Typography>
            
            <Table>
              <tbody>
                {cart.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            
            <Box sx={{ mt: 2, pt: 2, borderTop: 1 }}>
              <Typography variant="h6" align="right">
                Total: ${cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
              </Typography>
              
              <Button 
                fullWidth 
                variant="contained" 
                color="primary"
                sx={{ mt: 2 }}
                onClick={processTransaction}
                disabled={cart.length === 0}
              >
                Complete Sale
              </Button>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default POS;
```

## Environment Variables

Create `.env` file in the client directory:

```env
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_ENV=development
```

## Running the Frontend

```bash
cd client
npm start
```

The frontend will run on http://localhost:3001 (or the next available port).

## API Endpoints Reference

### Authentication
- POST `/api/auth/login` - User login
- POST `/api/auth/register` - User registration
- POST `/api/auth/logout` - User logout

### Products
- GET `/api/products` - Get all products
- POST `/api/products` - Create product
- PUT `/api/products/:id` - Update product
- DELETE `/api/products/:id` - Delete product

### Inventory
- GET `/api/inventory` - Get inventory levels
- POST `/api/inventory/adjustments` - Adjust stock
- GET `/api/inventory/movements` - Stock movement history

### Orders
- GET `/api/orders` - Get all orders
- POST `/api/orders` - Create order
- PATCH `/api/orders/:id/status` - Update order status

### POS
- POST `/api/pos/sessions` - Open POS session
- POST `/api/pos/sessions/:id/close` - Close session
- POST `/api/pos/transactions` - Process transaction

### Customers
- GET `/api/customers` - Get all customers
- POST `/api/customers` - Create customer
- GET `/api/customers/:id` - Get customer details

### Marketing
- GET `/api/marketing/promotions` - Get promotions
- POST `/api/marketing/promotions/validate` - Validate promo code
- GET `/api/marketing/loyalty/customer/:id` - Get loyalty points

### Accounting
- GET `/api/accounting/invoices` - Get invoices
- POST `/api/accounting/invoices` - Create invoice
- GET `/api/accounting/reports/profit-loss` - P&L report

### Reports
- GET `/api/reports/dashboard` - Dashboard metrics
- GET `/api/reports/sales` - Sales report
- GET `/api/reports/inventory` - Inventory report

## Next Steps

1. Implement all page components for each module
2. Add form validation using Formik and Yup
3. Implement proper error handling and toast notifications
4. Add loading states and skeletons
5. Implement responsive design for mobile devices
6. Add export functionality for reports
7. Implement real-time updates using WebSocket
8. Add offline support for POS
9. Implement proper authentication flow with refresh tokens
10. Add comprehensive testing

## Support

For issues or questions, refer to the backend API documentation or contact the development team.
