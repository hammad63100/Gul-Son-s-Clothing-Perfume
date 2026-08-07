import { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Input, Select, Alert, Textarea, StatCard } from '../components/common';
import { marketingService } from '../services/api';

export const MarketingPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('campaign');
  const [alert, setAlert] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'email',
    status: 'draft',
    startDate: '',
    endDate: '',
    budget: '',
    discountCode: '',
    discountType: 'percentage',
    discountValue: '',
  });

  useEffect(() => {
    loadCampaigns();
    loadPromotions();
  }, []);

  const loadCampaigns = async () => {
    try {
      const response = await marketingService.getCampaigns();
      setCampaigns(response.data || response.campaigns || []);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    }
  };

  const loadPromotions = async () => {
    try {
      const response = await marketingService.getPromotions();
      setPromotions(response.data || response.promotions || []);
    } catch (error) {
      console.error('Error loading promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (type) => {
    setModalType(type);
    setFormData({
      name: '',
      description: '',
      type: type === 'campaign' ? 'email' : 'percentage',
      status: 'draft',
      startDate: '',
      endDate: '',
      budget: '',
      discountCode: '',
      discountType: 'percentage',
      discountValue: '',
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'campaign') {
        await marketingService.createCampaign({
          ...formData,
          budget: parseFloat(formData.budget) || 0,
        });
        setAlert({ message: 'Campaign created successfully', type: 'success' });
        loadCampaigns();
      } else {
        await marketingService.createPromotion({
          ...formData,
          discountValue: parseFloat(formData.discountValue) || 0,
        });
        setAlert({ message: 'Promotion created successfully', type: 'success' });
        loadPromotions();
      }

      handleCloseModal();
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      setAlert({ message: 'Operation failed', type: 'error' });
    }
  };

  const campaignColumns = [
    { key: 'name', header: 'Campaign Name' },
    { 
      key: 'type', 
      header: 'Type',
      render: (type) => type.charAt(0).toUpperCase() + type.slice(1)
    },
    { 
      key: 'status', 
      header: 'Status',
      render: (status) => (
        <span className={`badge badge-${
          status === 'active' ? 'success' : 
          status === 'draft' ? 'warning' : 'secondary'
        }`}>
          {status}
        </span>
      )
    },
    { 
      key: 'startDate', 
      header: 'Start Date',
      render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A'
    },
    { 
      key: 'budget', 
      header: 'Budget',
      render: (budget) => `$${budget?.toFixed(2) || '0.00'}`
    },
  ];

  const promotionColumns = [
    { key: 'name', header: 'Promotion Name' },
    { key: 'discountCode', header: 'Code' },
    { 
      key: 'discountType', 
      header: 'Type',
      render: (type) => type === 'percentage' ? '%' : '$'
    },
    { 
      key: 'discountValue', 
      header: 'Value',
      render: (value, row) => row.discountType === 'percentage' ? `${value}%` : `$${value}`
    },
    { 
      key: 'startDate', 
      header: 'Valid From',
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
      <div className="page-header">
        <h1 className="page-title">Marketing</h1>
        <p className="page-subtitle">Manage campaigns and promotions</p>
      </div>

      {alert && <Alert message={alert.message} type={alert.type} />}

      <div className="stats-grid">
        <StatCard label="Active Campaigns" value={campaigns.filter(c => c.status === 'active').length} />
        <StatCard label="Total Promotions" value={promotions.length} />
        <StatCard label="Draft Campaigns" value={campaigns.filter(c => c.status === 'draft').length} />
      </div>

      <div className="grid grid-2">
        <Card 
          title="Marketing Campaigns"
          headerAction={
            <Button variant="primary" size="sm" onClick={() => handleOpenModal('campaign')}>
              + New Campaign
            </Button>
          }
        >
          <Table columns={campaignColumns} data={campaigns} />
        </Card>

        <Card 
          title="Promotions"
          headerAction={
            <Button variant="primary" size="sm" onClick={() => handleOpenModal('promotion')}>
              + New Promotion
            </Button>
          }
        >
          <Table columns={promotionColumns} data={promotions} />
        </Card>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={modalType === 'campaign' ? 'Create Campaign' : 'Create Promotion'}
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />

          {modalType === 'campaign' ? (
            <>
              <div className="grid grid-2">
                <Select
                  label="Campaign Type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  options={[
                    { value: 'email', label: 'Email' },
                    { value: 'social', label: 'Social Media' },
                    { value: 'sms', label: 'SMS' },
                    { value: 'print', label: 'Print' },
                  ]}
                />
                <Select
                  label="Status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  options={[
                    { value: 'draft', label: 'Draft' },
                    { value: 'active', label: 'Active' },
                    { value: 'completed', label: 'Completed' },
                  ]}
                />
              </div>

              <div className="grid grid-2">
                <Input
                  label="Start Date"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
                <Input
                  label="End Date"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>

              <Input
                label="Budget ($)"
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              />
            </>
          ) : (
            <>
              <Input
                label="Discount Code"
                value={formData.discountCode}
                onChange={(e) => setFormData({ ...formData, discountCode: e.target.value.toUpperCase() })}
                placeholder="e.g., SAVE20"
                required
              />

              <div className="grid grid-2">
                <Select
                  label="Discount Type"
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                  options={[
                    { value: 'percentage', label: 'Percentage (%)' },
                    { value: 'fixed', label: 'Fixed Amount ($)' },
                  ]}
                />
                <Input
                  label="Discount Value"
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-2">
                <Input
                  label="Valid From"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
                <Input
                  label="Valid Until"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </>
          )}

          <div className="modal-footer">
            <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit" variant="primary">Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
