import { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Input, Select, Alert, StatCard } from '../components/common';
import { accountingService } from '../services/api';

export const AccountingPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alert, setAlert] = useState(null);
  const [formData, setFormData] = useState({
    accountName: '',
    accountType: 'asset',
    accountNumber: '',
    description: '',
  });

  useEffect(() => {
    loadAccounts();
    loadInvoices();
  }, []);

  const loadAccounts = async () => {
    try {
      const response = await accountingService.getAccounts();
      setAccounts(response.data || response.accounts || []);
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const loadInvoices = async () => {
    try {
      const response = await accountingService.getInvoices();
      setInvoices(response.data || response.invoices || []);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setFormData({
      accountName: '',
      accountType: 'asset',
      accountNumber: '',
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await accountingService.createAccount(formData);
      setAlert({ message: 'Account created successfully', type: 'success' });
      handleCloseModal();
      loadAccounts();
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      setAlert({ message: 'Failed to create account', type: 'error' });
    }
  };

  const accountColumns = [
    { key: 'accountNumber', header: 'Account #' },
    { key: 'accountName', header: 'Account Name' },
    { 
      key: 'accountType', 
      header: 'Type',
      render: (type) => type.charAt(0).toUpperCase() + type.slice(1)
    },
    { 
      key: 'balance', 
      header: 'Balance',
      render: (balance) => `$${balance?.toFixed(2) || '0.00'}`
    },
  ];

  const invoiceColumns = [
    { key: 'invoiceNumber', header: 'Invoice #' },
    { 
      key: 'customer', 
      header: 'Customer',
      render: (_, row) => row.customer?.name || 'N/A'
    },
    { 
      key: 'status', 
      header: 'Status',
      render: (status) => (
        <span className={`badge badge-${
          status === 'paid' ? 'success' : 
          status === 'pending' ? 'warning' : 'danger'
        }`}>
          {status}
        </span>
      )
    },
    { 
      key: 'totalAmount', 
      header: 'Amount',
      render: (amount) => `$${amount?.toFixed(2) || '0.00'}`
    },
    { 
      key: 'dueDate', 
      header: 'Due Date',
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
          <h1 className="page-title">Accounting</h1>
          <p className="page-subtitle">Manage finances and invoices</p>
        </div>
        <Button variant="primary" onClick={handleOpenModal}>+ New Account</Button>
      </div>

      {alert && <Alert message={alert.message} type={alert.type} />}

      <div className="stats-grid">
        <StatCard label="Total Accounts" value={accounts.length} />
        <StatCard label="Pending Invoices" value={invoices.filter(i => i.status === 'pending').length} />
        <StatCard 
          label="Revenue" 
          value={`$${invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.totalAmount || 0), 0).toFixed(2)}`}
        />
      </div>

      <div className="grid grid-2">
        <Card title="Chart of Accounts">
          <Table columns={accountColumns} data={accounts} />
        </Card>

        <Card title="Recent Invoices">
          <Table columns={invoiceColumns} data={invoices.slice(0, 10)} />
        </Card>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Create New Account"
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="Account Name"
            value={formData.accountName}
            onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
            required
          />

          <Input
            label="Account Number"
            value={formData.accountNumber}
            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
            required
          />

          <Select
            label="Account Type"
            value={formData.accountType}
            onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
            options={[
              { value: 'asset', label: 'Asset' },
              { value: 'liability', label: 'Liability' },
              { value: 'equity', label: 'Equity' },
              { value: 'income', label: 'Income' },
              { value: 'expense', label: 'Expense' },
            ]}
            required
          />

          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="modal-footer">
            <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit" variant="primary">Create Account</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
