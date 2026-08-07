import { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Input, Select, Textarea, Alert, EmptyState } from '../components/common';
import { productService } from '../services/api';

export const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [alert, setAlert] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    price: '',
    cost: '',
    categoryId: '',
    stockQuantity: '',
    reorderLevel: '',
  });

  useEffect(() => {
    loadProducts();
    loadCategories();
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

  const loadCategories = async () => {
    try {
      const response = await productService.getCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        cost: product.cost?.toString() || '',
        categoryId: product.categoryId || '',
        stockQuantity: product.stockQuantity?.toString() || '',
        reorderLevel: product.reorderLevel?.toString() || '',
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        sku: '',
        description: '',
        price: '',
        cost: '',
        categoryId: '',
        stockQuantity: '',
        reorderLevel: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        cost: parseFloat(formData.cost) || 0,
        stockQuantity: parseInt(formData.stockQuantity) || 0,
        reorderLevel: parseInt(formData.reorderLevel) || 0,
      };

      if (editingProduct) {
        await productService.update(editingProduct.id, data);
        setAlert({ message: 'Product updated successfully', type: 'success' });
      } else {
        await productService.create(data);
        setAlert({ message: 'Product created successfully', type: 'success' });
      }

      handleCloseModal();
      loadProducts();
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      setAlert({ 
        message: error.response?.data?.message || 'Operation failed', 
        type: 'error' 
      });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await productService.delete(id);
      setAlert({ message: 'Product deleted successfully', type: 'success' });
      loadProducts();
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      setAlert({ message: 'Failed to delete product', type: 'error' });
    }
  };

  const categoryOptions = categories.map(cat => ({ value: cat.id, label: cat.name }));

  const columns = [
    { key: 'name', header: 'Product Name' },
    { key: 'sku', header: 'SKU' },
    { 
      key: 'price', 
      header: 'Price',
      render: (price) => `$${price?.toFixed(2) || '0.00'}`
    },
    { 
      key: 'stockQuantity', 
      header: 'Stock',
      render: (qty, row) => (
        <span style={{ color: qty <= (row.reorderLevel || 0) ? '#ef4444' : 'inherit' }}>
          {qty}
        </span>
      )
    },
    { 
      key: 'category', 
      header: 'Category',
      render: (_, row) => row.category?.name || 'Uncategorized'
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="secondary" size="sm" onClick={() => handleOpenModal(row)}>Edit</Button>
          <Button variant="danger" size="sm" onClick={() => handleDelete(row.id)}>Delete</Button>
        </div>
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
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">Manage your product catalog</p>
        </div>
        <Button variant="primary" onClick={() => handleOpenModal()}>+ Add Product</Button>
      </div>

      {alert && <Alert message={alert.message} type={alert.type} />}

      <Card>
        {products.length === 0 ? (
          <EmptyState
            icon="📦"
            title="No Products Yet"
            description="Get started by adding your first product"
            action={<Button variant="primary" onClick={() => handleOpenModal()}>Add Product</Button>}
          />
        ) : (
          <Table columns={columns} data={products} />
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-2">
            <Input
              label="Product Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="SKU"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              required
            />
          </div>

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="grid grid-2">
            <Input
              label="Price ($)"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
            <Input
              label="Cost ($)"
              type="number"
              step="0.01"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
            />
          </div>

          <Select
            label="Category"
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            options={categoryOptions}
          />

          <div className="grid grid-2">
            <Input
              label="Stock Quantity"
              type="number"
              value={formData.stockQuantity}
              onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
            />
            <Input
              label="Reorder Level"
              type="number"
              value={formData.reorderLevel}
              onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
            />
          </div>

          <div className="modal-footer">
            <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit" variant="primary">
              {editingProduct ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
