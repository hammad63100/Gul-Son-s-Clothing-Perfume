import { useState } from 'react';

export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export const Button = ({ children, variant = 'primary', size = 'md', onClick, type = 'button', disabled = false }) => {
  const className = `btn btn-${variant} ${size === 'sm' ? 'btn-sm' : ''}`;
  
  return (
    <button 
      type={type} 
      className={className} 
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export const Input = ({ label, type = 'text', value, onChange, placeholder, required = false, name }) => {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <input
        type={type}
        name={name}
        className="form-input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
};

export const Select = ({ label, value, onChange, options, required = false, name }) => {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <select
        name={name}
        className="form-select"
        value={value}
        onChange={onChange}
        required={required}
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export const Textarea = ({ label, value, onChange, placeholder, name, rows = 4 }) => {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <textarea
        name={name}
        className="form-textarea"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
      />
    </div>
  );
};

export const Badge = ({ children, variant = 'info' }) => {
  return <span className={`badge badge-${variant}`}>{children}</span>;
};

export const Card = ({ title, children, headerAction }) => {
  return (
    <div className="card">
      {(title || headerAction) && (
        <div className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export const StatCard = ({ label, value, change, changeType }) => {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {change && (
        <div className={`stat-change ${changeType === 'positive' ? 'positive' : 'negative'}`}>
          {changeType === 'positive' ? '↑' : '↓'} {change}
        </div>
      )}
    </div>
  );
};

export const Table = ({ columns, data, onRowClick }) => {
  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: '2rem' }}>
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr 
                key={row.id || index} 
                onClick={() => onRowClick && onRowClick(row)}
                style={{ cursor: onRowClick ? 'pointer' : 'default' }}
              >
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export const Loading = () => {
  return (
    <div className="loading">
      <div className="spinner"></div>
    </div>
  );
};

export const Alert = ({ message, type = 'success' }) => {
  return (
    <div className={`alert alert-${type}`}>
      {message}
    </div>
  );
};

export const EmptyState = ({ icon, title, description, action }) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      {description && <p>{description}</p>}
      {action && <div style={{ marginTop: '1rem' }}>{action}</div>}
    </div>
  );
};
