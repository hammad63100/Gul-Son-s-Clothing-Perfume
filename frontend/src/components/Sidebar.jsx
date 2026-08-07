import { Link, useLocation } from 'react-router-dom';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/products', label: 'Products', icon: '📦' },
  { path: '/inventory', label: 'Inventory', icon: '📋' },
  { path: '/orders', label: 'Orders', icon: '🛒' },
  { path: '/pos', label: 'POS', icon: '💳' },
  { path: '/customers', label: 'Customers', icon: '👥' },
  { path: '/marketing', label: 'Marketing', icon: '📢' },
  { path: '/accounting', label: 'Accounting', icon: '💰' },
  { path: '/reports', label: 'Reports', icon: '📈' },
  { path: '/users', label: 'Users', icon: '👤' },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>Retail ERP</h1>
      </div>
      <nav>
        <ul className="nav-menu">
          {menuItems.map((item) => (
            <li key={item.path} className="nav-item">
              <Link
                to={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};
