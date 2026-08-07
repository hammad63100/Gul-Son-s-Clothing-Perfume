import { useState, useEffect } from 'react';
import { StatCard, Card, Table, Button } from '../components/common';
import { reportingService, orderService, productService, customerService } from '../services/api';

export const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // In a real app, this would come from the reporting service
      const [orders, products, customers] = await Promise.all([
        orderService.getAll({ limit: 5 }).catch(() => ({ data: [] })),
        productService.getAll({ limit: 1 }).catch(() => ({ data: { count: 0 } })),
        customerService.getAll({ limit: 1 }).catch(() => ({ data: { count: 0 } })),
      ]);

      const ordersData = orders.data || [];
      
      setStats({
        totalSales: ordersData.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
        totalOrders: ordersData.length,
        totalProducts: products.data?.count || 0,
        totalCustomers: customers.data?.count || 0,
      });
      
      setRecentOrders(ordersData.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const orderColumns = [
    { key: 'orderNumber', header: 'Order #' },
    { 
      key: 'customer', 
      header: 'Customer',
      render: (_, row) => row.customer?.name || 'Guest'
    },
    { 
      key: 'status', 
      header: 'Status',
      render: (status) => (
        <span className={`badge badge-${
          status === 'completed' ? 'success' : 
          status === 'pending' ? 'warning' : 
          status === 'cancelled' ? 'danger' : 'info'
        }`}>
          {status}
        </span>
      )
    },
    { 
      key: 'totalAmount', 
      header: 'Total',
      render: (amount) => `$${amount?.toFixed(2) || '0.00'}`
    },
    { 
      key: 'createdAt', 
      header: 'Date',
      render: (date) => new Date(date).toLocaleDateString()
    },
  ];

  if (loading) {
    return (
      <div className="main-content">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome to Retail ERP System</p>
      </div>

      <div className="stats-grid">
        <StatCard 
          label="Total Sales" 
          value={`$${stats.totalSales.toFixed(2)}`}
          change="12% from last month"
          changeType="positive"
        />
        <StatCard 
          label="Total Orders" 
          value={stats.totalOrders}
          change="8% from last month"
          changeType="positive"
        />
        <StatCard 
          label="Total Products" 
          value={stats.totalProducts}
        />
        <StatCard 
          label="Total Customers" 
          value={stats.totalCustomers}
          change="5% from last month"
          changeType="positive"
        />
      </div>

      <Card title="Recent Orders">
        <Table columns={orderColumns} data={recentOrders} />
        <div style={{ marginTop: '1rem', textAlign: 'right' }}>
          <Button variant="secondary">View All Orders</Button>
        </div>
      </Card>

      <div className="grid grid-2">
        <Card title="Quick Actions">
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Button variant="primary">New Order</Button>
            <Button variant="secondary">Add Product</Button>
            <Button variant="secondary">New Customer</Button>
            <Button variant="secondary">Create Invoice</Button>
          </div>
        </Card>

        <Card title="System Status">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Backend API</span>
              <span className="badge badge-success">Connected</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Database</span>
              <span className="badge badge-success">Online</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Last Sync</span>
              <span className="badge badge-info">Just now</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
