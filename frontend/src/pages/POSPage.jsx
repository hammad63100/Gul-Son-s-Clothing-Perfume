import { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Input, Select, Alert, Badge } from '../components/common';
import { posService, productService } from '../services/api';

export const POSPage = () => {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alert, setAlert] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');

  useEffect(() => {
    loadProducts();
    loadSessions();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productService.getAll();
      setProducts(response.data || response.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async () => {
    try {
      const response = await posService.getSessions({ status: 'open' });
      const openSessions = response.data || response.sessions || [];
      setSessions(openSessions);
      if (openSessions.length > 0 && !currentSession) {
        setCurrentSession(openSessions[0]);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const handleOpenSession = async () => {
    try {
      const session = await posService.createSession({
        userId: 'current-user',
        openedAt: new Date().toISOString(),
      });
      setCurrentSession(session.data || session);
      setAlert({ message: 'POS session opened', type: 'success' });
      loadSessions();
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      setAlert({ message: 'Failed to open session', type: 'error' });
    }
  };

  const handleCloseSession = async () => {
    if (!currentSession) return;
    
    try {
      await posService.closeSession(currentSession.id);
      setCurrentSession(null);
      setCart([]);
      setAlert({ message: 'POS session closed', type: 'success' });
      loadSessions();
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      setAlert({ message: 'Failed to close session', type: 'error' });
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.productId === product.id);
    if (existingItem) {
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
        quantity: 1,
      }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCart(cart.map(item =>
      item.productId === productId ? { ...item, quantity } : item
    ));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setAlert({ message: 'Cart is empty', type: 'warning' });
      return;
    }

    if (!currentSession) {
      setAlert({ message: 'No active POS session', type: 'error' });
      return;
    }

    try {
      const transaction = await posService.createTransaction({
        sessionId: currentSession.id,
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: calculateTotal(),
        paymentMethod,
        customerName: customerName || 'Walk-in Customer',
      });

      setAlert({ message: 'Transaction completed successfully', type: 'success' });
      setCart([]);
      setCustomerName('');
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      setAlert({ message: 'Transaction failed', type: 'error' });
    }
  };

  const productColumns = [
    { key: 'name', header: 'Product' },
    { 
      key: 'price', 
      header: 'Price',
      render: (price) => `$${price?.toFixed(2) || '0.00'}`
    },
    { 
      key: 'stockQuantity', 
      header: 'Stock',
      render: (qty) => (
        <Badge variant={qty < 10 ? 'danger' : qty < 20 ? 'warning' : 'success'}>
          {qty}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <Button 
          variant="primary" 
          size="sm" 
          onClick={() => addToCart(row)}
          disabled={row.stockQuantity <= 0}
        >
          Add to Cart
        </Button>
      ),
    },
  ];

  const cartColumns = [
    { key: 'name', header: 'Product' },
    { 
      key: 'price', 
      header: 'Price',
      render: (price) => `$${price?.toFixed(2) || '0.00'}`
    },
    {
      key: 'quantity',
      header: 'Qty',
      render: (qty, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => updateQuantity(row.productId, qty - 1)}
          >-</button>
          <span>{qty}</span>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => updateQuantity(row.productId, qty + 1)}
          >+</button>
        </div>
      ),
    },
    { 
      key: 'total', 
      header: 'Total',
      render: (_, row) => `$${(row.price * row.quantity).toFixed(2)}`
    },
    {
      key: 'actions',
      header: '',
      render: (_, row) => (
        <Button variant="danger" size="sm" onClick={() => removeFromCart(row.productId)}>×</Button>
      ),
    },
  ];

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
          <h1 className="page-title">Point of Sale</h1>
          <p className="page-subtitle">Process sales transactions</p>
        </div>
        {!currentSession ? (
          <Button variant="success" onClick={handleOpenSession}>Open Session</Button>
        ) : (
          <Button variant="danger" onClick={handleCloseSession}>Close Session</Button>
        )}
      </div>

      {alert && <Alert message={alert.message} type={alert.type} />}

      {!currentSession ? (
        <Card>
          <div className="empty-state">
            <div className="empty-state-icon">💳</div>
            <h3 className="empty-state-title">No Active Session</h3>
            <p>Open a POS session to start processing transactions</p>
            <Button variant="primary" onClick={handleOpenSession} style={{ marginTop: '1rem' }}>
              Open Session
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-2">
          <Card title="Products">
            <Table columns={productColumns} data={products} />
          </Card>

          <Card 
            title="Shopping Cart"
            headerAction={
              <Badge variant={cart.length > 0 ? 'info' : 'secondary'}>
                {cart.length} items
              </Badge>
            }
          >
            <Table columns={cartColumns} data={cart} />
            
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
              <Input
                label="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Walk-in Customer"
              />

              <Select
                label="Payment Method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                options={[
                  { value: 'cash', label: 'Cash' },
                  { value: 'card', label: 'Credit/Debit Card' },
                  { value: 'digital', label: 'Digital Wallet' },
                ]}
              />

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '1rem',
                padding: '1rem',
                backgroundColor: '#f8fafc',
                borderRadius: '0.5rem'
              }}>
                <span style={{ fontWeight: '600', fontSize: '1.125rem' }}>Total:</span>
                <span style={{ fontWeight: '700', fontSize: '1.5rem', color: '#2563eb' }}>
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>

              <Button 
                variant="success" 
                onClick={handleCheckout}
                disabled={cart.length === 0}
                style={{ width: '100%' }}
              >
                Complete Sale
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
