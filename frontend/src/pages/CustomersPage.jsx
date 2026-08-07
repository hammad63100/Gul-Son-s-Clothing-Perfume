import { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Input, Select, Alert, Textarea } from '../components/common';
import { customerService } from '../services/api';

export const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [alert, setAlert] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    notes: '',
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const response = await customerService.getAll();
      setCustomers(response.data || response.customers || []);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (customer = null) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        zipCode: customer.zipCode || '',
        notes: customer.notes || '',
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        notes: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await customerService.update(editingCustomer.id, formData);
        setAlert({ message: 'Customer updated successfully', type: 'success' });
      } else {
        await customerService.create(formData);
        setAlert({ message: 'Customer created successfully', type: 'success' });
      }

      handleCloseModal();
      loadCustomers();
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      setAlert({ message: 'Operation failed', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    
    try {
      await customerService.delete(id);
      setAlert({ message: 'Customer deleted successfully', type: 'success' });
      loadCustomers();
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      setAlert({ message: 'Failed to delete customer', type: 'error' });
    }
  };

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    { 
      key: 'city', 
      header: 'Location',
      render: (_, row) => `${row.city || ''}${row.city && row.state ? ', ' : ''}${row.state || ''}`
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
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">Manage customer relationships</p>
        </div>
        <Button variant="primary" onClick={() => handleOpenModal()}>+ Add Customer</Button>
      </div>

      {alert && <Alert message={alert.message} type={alert.type} />}

      <Card>
        <Table columns={columns} data={customers} />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="grid grid-2">
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <Textarea
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            rows={2}
          />

          <div className="grid grid-3">
            <Input
              label="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
            <Input
              label="State"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            />
            <Input
              label="ZIP Code"
              value={formData.zipCode}
              onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
            />
          </div>

          <Textarea
            label="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
          />

          <div className="modal-footer">
            <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit" variant="primary">
              {editingCustomer ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
