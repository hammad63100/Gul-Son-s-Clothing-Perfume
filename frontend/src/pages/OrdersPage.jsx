import { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Input, Select, Alert, Badge, Textarea } from '../components/common';
import { orderService, customerService, productService } from '../services/api';

export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [alert, setAlert] = useState(null);
  const [formData, setFormData] = useState({
    customerId: '',
    items: [{ productId: '', quantity: 1, price: 0 }],
    shippingAddress: '',
    notes: '',
  });

  useEffect(() => {
    loadOrders();
    loadCustomers();
    loadProducts();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await orderService.getAll();
      setOrders(response.data || response.orders || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await customerService.getAll();
      setCustomers(response.data || response.customers || []);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await productService.getAll();
      setProducts(response.data || response.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleOpenModal = () => {
    setFormData({
      customerId: '',
      items: [{ productId: '', quantity: 1, price: 0 }],
      shippingAddress: '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: '', quantity: 1, price: 0 }],
    });
  };

  const handleRemoveItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    
    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      if (product) {
        newItems[index].price = product.price || 0;
      }
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const orderData = {
        customerId: formData.customerId,
        items: formData.items.map(item => ({
          productId: item.productId,
          quantity: parseInt(item.quantity),
          price: parseFloat(item.price),
        })),
        shippingAddress: formData.shippingAddress,
        notes: formData.notes,
      };
      
      await orderService.create(orderData);
      setAlert({ message: 'Order created successfully', type: 'success' });
      handleCloseModal();
      loadOrders();
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      setAlert({ message: 'Failed to create order', type: 'error' });
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await orderService.updateStatus(orderId, status);
      setAlert({ message: `Order ${status}`, type: 'success' });
      loadOrders();
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      setAlert({ message: 'Failed to update status', type: 'error' });
    }
  };

  const handleViewOrder = (order) => {
    setViewingOrder(order);
  };

  const customerOptions = customers.map(c => ({ value: c.id, label: c.name }));
  const productOptions = products.map(p => ({ value: p.id, label: `${p.name} - $${p.price}` }));

  const columns = [
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
        <Badge variant={
          status === 'completed' ? 'success' : 
          status === 'pending' ? 'warning' : 
          status === 'cancelled' ? 'danger' : 'info'
        }>
          {status}
        </Badge>
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
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="secondary" size="sm" onClick={() => handleViewOrder(row)}>View</Button>
          {row.status === 'pending' && (
            <>
              <Button 
                variant="success" 
                size="sm" 
                onClick={() => handleUpdateStatus(row.id, 'completed')}
              >
                Complete
              </Button>
              <Button 
                variant="danger" 
                size="sm" 
                onClick={() => handleUpdateStatus(row.id, 'cancelled')}
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  if (loading) {
    return (
      <div className="main-content">
        <div className="loading"><div className="spinner"></div></div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">Manage customer orders</p>
        </div>
        <Button variant="primary" onClick={handleOpenModal}>+ New Order</Button>
      </div>

      {alert && <Alert message={alert.message} type={alert.type} />}

      <Card>
        <Table columns={columns} data={orders} />
      </Card>

      {/* Create Order Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Create New Order"
      >
        <form onSubmit={handleSubmit}>
          <Select
            label="Customer"
            value={formData.customerId}
            onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
            options={customerOptions}
            required
          />

          <div style={{ marginBottom: '1rem' }}>
            <label className="form-label">Order Items</label>
            {formData.items.map((item, index) => (
              <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                <select
                  className="form-select"
                  value={item.productId}
                  onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                  style={{ flex: 2 }}
                  required
                >
                  <option value="">Select Product</option>
                  {productOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <input
                  type="number"
                  className="form-input"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                  placeholder="Qty"
                  style={{ flex: 1 }}
                  min="1"
                  required
                />
                <input
                  type="number"
                  className="form-input"
                  value={item.price}
                  onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                  placeholder="Price"
                  style={{ flex: 1 }}
                  step="0.01"
                  required
                />
                {formData.items.length > 1 && (
                  <Button variant="danger" size="sm" onClick={() => handleRemoveItem(index)}>×</Button>
                )}
              </div>
            ))}
            <Button variant="secondary" size="sm" onClick={handleAddItem}>+ Add Item</Button>
          </div>

          <div style={{ textAlign: 'right', marginBottom: '1rem', fontWeight: '600' }}>
            Total: ${calculateTotal().toFixed(2)}
          </div>

          <Textarea
            label="Shipping Address"
            value={formData.shippingAddress}
            onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
            rows={2}
          />

          <Textarea
            label="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />

          <div className="modal-footer">
            <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit" variant="primary">Create Order</Button>
          </div>
        </form>
      </Modal>

      {/* View Order Modal */}
      {viewingOrder && (
        <Modal
          isOpen={!!viewingOrder}
          onClose={() => setViewingOrder(null)}
          title={`Order #${viewingOrder.orderNumber}`}
        >
          <div style={{ marginBottom: '1rem' }}>
            <p><strong>Customer:</strong> {viewingOrder.customer?.name || 'Guest'}</p>
            <p><strong>Status:</strong> <Badge variant={
              viewingOrder.status === 'completed' ? 'success' : 
              viewingOrder.status === 'pending' ? 'warning' : 'danger'
            }>{viewingOrder.status}</Badge></p>
            <p><strong>Total:</strong> ${viewingOrder.totalAmount?.toFixed(2)}</p>
            <p><strong>Date:</strong> {new Date(viewingOrder.createdAt).toLocaleString()}</p>
            {viewingOrder.shippingAddress && (
              <p><strong>Shipping:</strong> {viewingOrder.shippingAddress}</p>
            )}
          </div>
          
          <h4 style={{ marginBottom: '0.5rem' }}>Items</h4>
          <table style={{ width: '100%', marginBottom: '1rem' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Product</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {viewingOrder.items?.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.product?.name || 'Product'}</td>
                  <td>{item.quantity}</td>
                  <td>${item.price?.toFixed(2)}</td>
                  <td>${(item.quantity * item.price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="modal-footer">
            <Button variant="secondary" onClick={() => setViewingOrder(null)}>Close</Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
