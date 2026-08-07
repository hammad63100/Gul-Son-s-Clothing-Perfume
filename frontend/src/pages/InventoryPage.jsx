import { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Input, Select, Alert, Badge } from '../components/common';
import { inventoryService, productService } from '../services/api';

export const InventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alert, setAlert] = useState(null);
  const [formData, setFormData] = useState({
    productId: '',
    warehouseId: '',
    quantity: '',
    adjustmentType: 'add',
    reason: '',
  });

  useEffect(() => {
    loadInventory();
    loadWarehouses();
    loadProducts();
  }, []);

  const loadInventory = async () => {
    try {
      const response = await inventoryService.getAll();
      setInventory(response.data || response.inventory || []);
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWarehouses = async () => {
    try {
      const response = await inventoryService.getWarehouses();
      setWarehouses(response.data || response.warehouses || []);
    } catch (error) {
      console.error('Error loading warehouses:', error);
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
      productId: '',
      warehouseId: '',
      quantity: '',
      adjustmentType: 'add',
      reason: '',
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await inventoryService.adjustStock({
        productId: formData.productId,
        warehouseId: formData.warehouseId,
        quantity: parseInt(formData.quantity),
        type: formData.adjustmentType,
        reason: formData.reason,
      });
      setAlert({ message: 'Stock adjusted successfully', type: 'success' });
      handleCloseModal();
      loadInventory();
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      setAlert({ message: 'Failed to adjust stock', type: 'error' });
    }
  };

  const productOptions = products.map(p => ({ value: p.id, label: p.name }));
  const warehouseOptions = warehouses.map(w => ({ value: w.id, label: w.name }));

  const columns = [
    { 
      key: 'product', 
      header: 'Product',
      render: (_, row) => row.product?.name || 'Unknown'
    },
    { 
      key: 'warehouse', 
      header: 'Warehouse',
      render: (_, row) => row.warehouse?.name || 'Default'
    },
    { 
      key: 'quantity', 
      header: 'Quantity',
      render: (qty) => (
        <Badge variant={qty < 10 ? 'danger' : qty < 20 ? 'warning' : 'success'}>
          {qty}
        </Badge>
      )
    },
    { 
      key: 'reorderLevel', 
      header: 'Reorder Level',
      render: (level) => level || 'N/A'
    },
    {
      key: 'updatedAt',
      header: 'Last Updated',
      render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A'
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
          <h1 className="page-title">Inventory</h1>
          <p className="page-subtitle">Track and manage stock levels</p>
        </div>
        <Button variant="primary" onClick={handleOpenModal}>Adjust Stock</Button>
      </div>

      {alert && <Alert message={alert.message} type={alert.type} />}

      <Card>
        <Table columns={columns} data={inventory} />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Adjust Stock"
      >
        <form onSubmit={handleSubmit}>
          <Select
            label="Product"
            value={formData.productId}
            onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
            options={productOptions}
            required
          />

          <Select
            label="Warehouse"
            value={formData.warehouseId}
            onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
            options={warehouseOptions}
            required
          />

          <Select
            label="Adjustment Type"
            value={formData.adjustmentType}
            onChange={(e) => setFormData({ ...formData, adjustmentType: e.target.value })}
            options={[
              { value: 'add', label: 'Add Stock' },
              { value: 'remove', label: 'Remove Stock' },
            ]}
            required
          />

          <Input
            label="Quantity"
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            required
          />

          <Input
            label="Reason"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            placeholder="e.g., Stock count, Damaged goods, etc."
          />

          <div className="modal-footer">
            <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit" variant="primary">Submit</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
