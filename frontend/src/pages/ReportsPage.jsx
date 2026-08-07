import { useState, useEffect } from 'react';
import { Card, Table, Button, StatCard } from '../components/common';
import { reportingService } from '../services/api';

export const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const response = await reportingService.getReports();
      setReports(response.data || response.reports || []);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const reportTypes = [
    { id: 'sales', name: 'Sales Report', icon: '💰', description: 'Analyze sales performance' },
    { id: 'inventory', name: 'Inventory Report', icon: '📦', description: 'Track stock levels and movements' },
    { id: 'customers', name: 'Customer Report', icon: '👥', description: 'Customer analytics and insights' },
    { id: 'products', name: 'Product Report', icon: '🏷️', description: 'Product performance analysis' },
    { id: 'financial', name: 'Financial Report', icon: '📊', description: 'Profit, loss, and cash flow' },
    { id: 'pos', name: 'POS Report', icon: '💳', description: 'Point of sale transactions' },
  ];

  const handleGenerateReport = async (reportType) => {
    try {
      await reportingService.generateReport({
        type: reportType,
        dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        dateTo: new Date().toISOString(),
      });
      alert(`${reportType} report generated successfully!`);
    } catch (error) {
      alert('Failed to generate report');
    }
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
      <div className="page-header">
        <h1 className="page-title">Reports & Analytics</h1>
        <p className="page-subtitle">Generate insights and business intelligence</p>
      </div>

      <div className="stats-grid">
        <StatCard label="Total Reports" value={reports.length} />
        <StatCard label="This Month" value={reports.filter(r => new Date(r.createdAt).getMonth() === new Date().getMonth()).length} />
        <StatCard label="Pending" value={reports.filter(r => r.status === 'pending').length} />
      </div>

      <Card title="Available Reports">
        <div className="grid grid-3">
          {reportTypes.map((report) => (
            <div 
              key={report.id}
              className="card"
              style={{ 
                textAlign: 'center', 
                padding: '2rem',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                border: '1px solid #e2e8f0'
              }}
              onClick={() => handleGenerateReport(report.id)}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{report.icon}</div>
              <h3 style={{ marginBottom: '0.5rem', color: '#1e293b' }}>{report.name}</h3>
              <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                {report.description}
              </p>
              <Button variant="primary">Generate Report</Button>
            </div>
          ))}
        </div>
      </Card>

      {reports.length > 0 && (
        <Card title="Recent Reports">
          <Table
            columns={[
              { key: 'name', header: 'Report Name' },
              { key: 'type', header: 'Type' },
              { 
                key: 'status', 
                header: 'Status',
                render: (status) => (
                  <span className={`badge badge-${
                    status === 'completed' ? 'success' : 
                    status === 'pending' ? 'warning' : 'secondary'
                  }`}>
                    {status}
                  </span>
                )
              },
              { 
                key: 'createdAt', 
                header: 'Generated',
                render: (date) => new Date(date).toLocaleString()
              },
              {
                key: 'actions',
                header: 'Actions',
                render: (_, row) => (
                  <Button variant="secondary" size="sm">Download</Button>
                ),
              },
            ]}
            data={reports.slice(0, 5)}
          />
        </Card>
      )}
    </div>
  );
};
