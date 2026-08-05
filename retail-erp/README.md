# Retail ERP System - Authentication & RBAC Module

## 📋 Overview
This module implements a complete Authentication and Role-Based Access Control (RBAC) system for the Retail Business Management System. It provides secure user registration, login, password management, and granular permission control across all system modules.

## 🏗️ Architecture

### Components Implemented
- **User Model**: Secure user storage with password hashing
- **Role Model**: 11 predefined roles with hierarchy
- **Permission Model**: Granular permissions per module and action
- **Auth Middleware**: JWT-based authentication and authorization
- **Rate Limiting**: Protection against brute force attacks
- **Validation**: Comprehensive input validation
- **Error Handling**: Centralized error management
- **Logging**: Audit trail with Winston logger

### Directory Structure
```
retail-erp/
├── src/
│   ├── config/
│   │   ├── database.js      # Sequelize configuration
│   │   └── logger.js        # Winston logger setup
│   ├── middleware/
│   │   ├── auth.js          # JWT auth & authorization
│   │   ├── rateLimiter.js   # Rate limiting rules
│   │   └── errorHandler.js  # Global error handling
│   ├── models/
│   │   ├── User.js          # User model
│   │   ├── Role.js          # Role model
│   │   ├── Permission.js    # Permission model
│   │   ├── RolePermission.js# Junction table
│   │   └── index.js         # Model relationships
│   ├── services/
│   │   └── authService.js   # Business logic
│   ├── validators/
│   │   └── userValidator.js # Input validation rules
│   ├── routes/
│   │   └── authRoutes.js    # API endpoints
│   ├── utils/
│   │   └── helpers.js       # Utility functions
│   └── app.js               # Express application
├── logs/                    # Application logs
├── .env.example            # Environment template
└── package.json            # Dependencies
```

## 🔐 Security Features

### Password Security
- Bcrypt hashing with configurable rounds (default: 12)
- Minimum 8 characters with complexity requirements
- Password change tracking
- Secure password reset flow

### Token Security
- JWT tokens with expiration (default: 7 days)
- Token invalidation on password change
- Refresh token support ready
- Secure cookie storage option

### Rate Limiting
- General API: 100 requests per 15 minutes
- Authentication: 5 attempts per 15 minutes
- Password reset: 3 attempts per hour
- Sensitive operations: 10 per 5 minutes

### Input Validation
- Email format validation
- Phone number format validation
- SQL injection prevention
- XSS protection
- Request size limits (10MB)

## 👥 Roles & Permissions

### Predefined Roles (11)
1. **Super Admin** - Full system access
2. **Owner** - Full business access
3. **Manager** - Operational management
4. **Inventory Manager** - Inventory control
5. **Accountant** - Financial management
6. **Sales Employee** - Sales operations
7. **Warehouse Staff** - Warehouse operations
8. **Cashier** - POS operations
9. **Delivery Staff** - Delivery management
10. **Customer** - Customer portal access
11. **Guest** - Limited browse access

### Permission Matrix
Each role has specific permissions across 16 modules:
- users, roles, products, inventory, orders, pos
- customers, suppliers, purchases, accounting
- reports, website, blog, marketing, settings, employees

Actions per module: create, read, update, delete, approve, export, import, manage

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login user
GET    /api/auth/me                - Get current user profile
PUT    /api/auth/profile           - Update profile
PUT    /api/auth/change-password   - Change password
GET    /api/auth/users             - List users (paginated)
DELETE /api/auth/users/:id         - Deactivate user
POST   /api/auth/init-roles        - Initialize roles (Super Admin)
```

### Request/Response Examples

#### Register User
```json
POST /api/auth/register
{
  "email": "john@example.com",
  "password": "SecureP@ss123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}

Response:
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### Login
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "SecureP@ss123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

## 🗄️ Database Schema

### Users Table
- id (UUID, PK)
- email (unique, indexed)
- password (hashed)
- firstName, lastName
- phone
- roleId (FK)
- isActive, isEmailVerified
- lastLoginAt, passwordChangedAt
- twoFactorEnabled, twoFactorSecret
- timestamps

### Roles Table
- id (PK, auto-increment)
- name (unique)
- description
- isSystemRole
- isActive

### Permissions Table
- id (PK, auto-increment)
- name (unique)
- description
- module
- action
- isActive

### Role_Permissions Table
- id (PK)
- roleId (FK)
- permissionId (FK)
- isGranted
- Unique constraint on (roleId, permissionId)

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- PostgreSQL 12+
- npm or yarn

### Installation

1. **Clone and install dependencies**
```bash
cd retail-erp
npm install
```

2. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. **Start development server**
```bash
npm run dev
```

4. **Initialize database**
The application automatically:
- Creates database tables
- Initializes 11 default roles
- Creates 128 permissions (16 modules × 8 actions)
- Assigns all permissions to Super Admin role

### First Time Setup

Create initial Super Admin:
```bash
# Use the register endpoint with roleId for super_admin
POST /api/auth/register
{
  "email": "admin@retail.com",
  "password": "Admin@123456",
  "firstName": "System",
  "lastName": "Administrator",
  "roleId": 1  // Super Admin role ID
}
```

## ✅ Testing

### Health Check
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```

### Test Registration
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123456",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123456"
  }'
```

### Test Protected Endpoint
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📊 Monitoring & Logging

### Log Files
- `logs/error.log` - Error level logs only
- `logs/combined.log` - All logs

### Log Levels
- error: Application errors
- warn: Warning conditions
- info: Informational messages
- debug: Detailed debugging information

## 🔧 Configuration

### Environment Variables
```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=retail_erp
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

## 🛡️ Security Best Practices Implemented

1. **Password Hashing**: Bcrypt with salt rounds
2. **JWT Tokens**: Signed tokens with expiration
3. **Rate Limiting**: Prevents brute force attacks
4. **Input Validation**: Sanitizes all user inputs
5. **Helmet.js**: Sets security HTTP headers
6. **CORS**: Configured for specific origins
7. **SQL Injection Prevention**: Parameterized queries via Sequelize
8. **XSS Protection**: Input sanitization
9. **Audit Logging**: All authentication events logged
10. **Role Hierarchy**: Prevents privilege escalation

## 📈 Next Steps

### Module 2: Product Management
The next module will implement:
- Product CRUD operations
- Category and brand management
- Variant matrix (sizes, colors)
- SKU generation
- Pricing engine
- Image/video management
- Bulk import/export
- SEO optimization
- Publishing workflows

## 📝 License
ISC

## 🤝 Contributing
This is an enterprise system. Contact the development team for contribution guidelines.
