# Retail ERP System - Frontend

A comprehensive React-based frontend for the Retail ERP System with a modern, light-themed UI.

## Features

### Modules Implemented

1. **Dashboard** - Overview with key metrics and statistics
2. **Products** - Product catalog management with CRUD operations
3. **Inventory** - Stock tracking and warehouse management
4. **Orders** - Order management with status tracking
5. **POS (Point of Sale)** - In-store sales processing
6. **Customers** - Customer relationship management
7. **Marketing** - Campaigns and promotions management
8. **Accounting** - Financial accounts and invoices
9. **Reports** - Business intelligence and analytics
10. **Users** - User management and permissions

### Key Features

- ✅ Light theme with modern UI design
- ✅ Responsive sidebar navigation
- ✅ Authentication with JWT tokens
- ✅ Protected routes
- ✅ Reusable components (Modal, Table, Card, Forms)
- ✅ API integration with axios
- ✅ Form handling with validation
- ✅ Real-time data updates
- ✅ Loading states and error handling
- ✅ Toast notifications

## Tech Stack

- **React 18** - UI library
- **React Router v6** - Navigation
- **Axios** - HTTP client
- **Vite** - Build tool
- **CSS3** - Custom styling with CSS variables

## Installation

```bash
cd frontend
npm install
```

## Running the Application

### Development Mode
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Production Build
```bash
npm run build
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── common.jsx      # Reusable UI components
│   │   └── Sidebar.jsx     # Navigation sidebar
│   ├── context/
│   │   └── AuthContext.jsx # Authentication context
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── ProductsPage.jsx
│   │   ├── InventoryPage.jsx
│   │   ├── OrdersPage.jsx
│   │   ├── POSPage.jsx
│   │   ├── CustomersPage.jsx
│   │   ├── MarketingPage.jsx
│   │   ├── AccountingPage.jsx
│   │   ├── ReportsPage.jsx
│   │   └── UsersPage.jsx
│   ├── services/
│   │   └── api.js          # API service layer
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── index.html
├── package.json
└── vite.config.js
```

## API Integration

The frontend connects to the backend API at `/api` (proxied to `http://localhost:5000` in development).

### Available Services

- `authService` - Login, logout, registration
- `productService` - Product CRUD operations
- `inventoryService` - Stock management
- `orderService` - Order management
- `posService` - POS transactions
- `customerService` - Customer management
- `marketingService` - Campaigns and promotions
- `accountingService` - Financial operations
- `reportingService` - Reports generation
- `userService` - User management

## Authentication

The app uses JWT-based authentication:
- Tokens are stored in localStorage
- Automatic token refresh on 401 errors
- Protected routes redirect to login page

## Demo Credentials

```
Email: admin@retail.com
Password: admin123
```

## Styling

The app uses a light theme with CSS variables for easy customization:

```css
:root {
  --primary-color: #2563eb;
  --background-light: #f8fafc;
  --background-white: #ffffff;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --border-color: #e2e8f0;
}
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
