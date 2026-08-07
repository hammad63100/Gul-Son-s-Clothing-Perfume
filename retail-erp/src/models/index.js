const User = require('./User');
const Role = require('./Role');
const Permission = require('./Permission');
const RolePermission = require('./RolePermission');
const Category = require('./Category');
const Brand = require('./Brand');
const Product = require('./Product');
const ProductVariant = require('./ProductVariant');
const ProductImage = require('./ProductImage');
const Warehouse = require('./Warehouse');
const Inventory = require('./Inventory');
const StockMovement = require('./StockMovement');
const Supplier = require('./Supplier');
const PurchaseOrder = require('./PurchaseOrder');
const PurchaseOrderItem = require('./PurchaseOrderItem');
const StockTransfer = require('./StockTransfer');
const StockTransferItem = require('./StockTransferItem');
const Customer = require('./Customer');
const CustomerAddress = require('./CustomerAddress');
const CustomerInteraction = require('./CustomerInteraction');
const CustomerSegment = require('./CustomerSegment');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const OrderPayment = require('./OrderPayment');
const OrderShipment = require('./OrderShipment');
const POSession = require('./POSSession');
const POSTransaction = require('./POSTransaction');
const Campaign = require('./Campaign');
const Promotion = require('./Promotion');
const LoyaltyProgram = require('./LoyaltyProgram');
const LoyaltyTransaction = require('./LoyaltyTransaction');
const Account = require('./Account');
const JournalEntry = require('./JournalEntry');
const JournalEntryLine = require('./JournalEntryLine');
const Invoice = require('./Invoice');
const InvoiceItem = require('./InvoiceItem');
const InvoicePayment = require('./InvoicePayment');
const TaxRate = require('./TaxRate');
const Report = require('./Report');
const ReportSnapshot = require('./ReportSnapshot');
const AuditLog = require('./AuditLog');
const SystemSetting = require('./SystemSetting');
const Notification = require('./Notification');

// Define relationships
User.belongsTo(Role, { 
  foreignKey: 'roleId', 
  as: 'role',
  onDelete: 'RESTRICT'
});
Role.hasMany(User, { 
  foreignKey: 'roleId', 
  as: 'users' 
});

Role.belongsToMany(Permission, { 
  through: RolePermission, 
  foreignKey: 'roleId',
  otherKey: 'permissionId',
  as: 'permissions'
});
Permission.belongsToMany(Role, { 
  through: RolePermission, 
  foreignKey: 'permissionId',
  otherKey: 'roleId',
  as: 'roles'
});

Role.hasMany(RolePermission, { 
  foreignKey: 'roleId', 
  as: 'rolePermissions' 
});
Permission.hasMany(RolePermission, { 
  foreignKey: 'permissionId', 
  as: 'rolePermissions' 
});
RolePermission.belongsTo(Role, { 
  foreignKey: 'roleId', 
  as: 'role' 
});
RolePermission.belongsTo(Permission, { 
  foreignKey: 'permissionId', 
  as: 'permission' 
});

// Category self-referencing relationship (for hierarchical categories)
Category.belongsTo(Category, {
  foreignKey: 'parentId',
  as: 'parent'
});
Category.hasMany(Category, {
  foreignKey: 'parentId',
  as: 'children'
});

// Brand relationships
Brand.hasMany(Product, {
  foreignKey: 'brandId',
  as: 'products'
});
Product.belongsTo(Brand, {
  foreignKey: 'brandId',
  as: 'brand'
});

// Category relationships
Category.hasMany(Product, {
  foreignKey: 'categoryId',
  as: 'products'
});
Product.belongsTo(Category, {
  foreignKey: 'categoryId',
  as: 'category'
});

// Product - Variant relationships
Product.hasMany(ProductVariant, {
  foreignKey: 'productId',
  as: 'variants',
  onDelete: 'CASCADE'
});
ProductVariant.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product'
});

// Product - Image relationships
Product.hasMany(ProductImage, {
  foreignKey: 'productId',
  as: 'images',
  onDelete: 'CASCADE'
});
ProductImage.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product'
});

// Variant - Image relationships
ProductVariant.hasMany(ProductImage, {
  foreignKey: 'variantId',
  as: 'variantImages',
  onDelete: 'SET NULL'
});
ProductImage.belongsTo(ProductVariant, {
  foreignKey: 'variantId',
  as: 'variant'
});

// Warehouse - Inventory relationships
Warehouse.hasMany(Inventory, {
  foreignKey: 'warehouseId',
  as: 'inventoryItems'
});
Inventory.belongsTo(Warehouse, {
  foreignKey: 'warehouseId',
  as: 'warehouse'
});

// Product - Inventory relationships
Product.hasMany(Inventory, {
  foreignKey: 'productId',
  as: 'inventoryItems',
  onDelete: 'CASCADE'
});
Inventory.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product'
});

// Variant - Inventory relationships
ProductVariant.hasMany(Inventory, {
  foreignKey: 'variantId',
  as: 'variantInventoryItems',
  onDelete: 'CASCADE'
});
Inventory.belongsTo(ProductVariant, {
  foreignKey: 'variantId',
  as: 'variant'
});

// Product - StockMovement relationships
Product.hasMany(StockMovement, {
  foreignKey: 'productId',
  as: 'stockMovements',
  onDelete: 'CASCADE'
});
StockMovement.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product'
});

// Variant - StockMovement relationships
ProductVariant.hasMany(StockMovement, {
  foreignKey: 'variantId',
  as: 'variantStockMovements',
  onDelete: 'SET NULL'
});
StockMovement.belongsTo(ProductVariant, {
  foreignKey: 'variantId',
  as: 'variant'
});

// Warehouse - StockMovement relationships
Warehouse.hasMany(StockMovement, {
  foreignKey: 'warehouseId',
  as: 'stockMovements'
});
StockMovement.belongsTo(Warehouse, {
  foreignKey: 'warehouseId',
  as: 'warehouse'
});

// Supplier - PurchaseOrder relationships
Supplier.hasMany(PurchaseOrder, {
  foreignKey: 'supplierId',
  as: 'purchaseOrders'
});
PurchaseOrder.belongsTo(Supplier, {
  foreignKey: 'supplierId',
  as: 'supplier'
});

// Warehouse - PurchaseOrder relationships
Warehouse.hasMany(PurchaseOrder, {
  foreignKey: 'warehouseId',
  as: 'purchaseOrders'
});
PurchaseOrder.belongsTo(Warehouse, {
  foreignKey: 'warehouseId',
  as: 'warehouse'
});

// PurchaseOrder - PurchaseOrderItem relationships
PurchaseOrder.hasMany(PurchaseOrderItem, {
  foreignKey: 'purchaseOrderId',
  as: 'items',
  onDelete: 'CASCADE'
});
PurchaseOrderItem.belongsTo(PurchaseOrder, {
  foreignKey: 'purchaseOrderId',
  as: 'purchaseOrder'
});

// Product - PurchaseOrderItem relationships
Product.hasMany(PurchaseOrderItem, {
  foreignKey: 'productId',
  as: 'purchaseOrderItems'
});
PurchaseOrderItem.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product'
});

// Variant - PurchaseOrderItem relationships
ProductVariant.hasMany(PurchaseOrderItem, {
  foreignKey: 'variantId',
  as: 'variantPurchaseOrderItems',
  onDelete: 'SET NULL'
});
PurchaseOrderItem.belongsTo(ProductVariant, {
  foreignKey: 'variantId',
  as: 'variant'
});

// StockTransfer - StockTransferItem relationships
StockTransfer.hasMany(StockTransferItem, {
  foreignKey: 'stockTransferId',
  as: 'items',
  onDelete: 'CASCADE'
});
StockTransferItem.belongsTo(StockTransfer, {
  foreignKey: 'stockTransferId',
  as: 'stockTransfer'
});

// StockTransfer - Warehouse relationships (from)
StockTransfer.belongsTo(Warehouse, {
  foreignKey: 'fromWarehouseId',
  as: 'fromWarehouse'
});

// StockTransfer - Warehouse relationships (to)
StockTransfer.belongsTo(Warehouse, {
  foreignKey: 'toWarehouseId',
  as: 'toWarehouse'
});

// Product - StockTransferItem relationships
Product.hasMany(StockTransferItem, {
  foreignKey: 'productId',
  as: 'stockTransferItems'
});
StockTransferItem.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product'
});

// Variant - StockTransferItem relationships
ProductVariant.hasMany(StockTransferItem, {
  foreignKey: 'variantId',
  as: 'variantStockTransferItems',
  onDelete: 'SET NULL'
});
StockTransferItem.belongsTo(ProductVariant, {
  foreignKey: 'variantId',
  as: 'variant'
});

// Customer - CustomerAddress relationships
Customer.hasMany(CustomerAddress, {
  foreignKey: 'customerId',
  as: 'addresses',
  onDelete: 'CASCADE'
});
CustomerAddress.belongsTo(Customer, {
  foreignKey: 'customerId',
  as: 'customer'
});

// Customer - CustomerInteraction relationships
Customer.hasMany(CustomerInteraction, {
  foreignKey: 'customerId',
  as: 'interactions',
  onDelete: 'CASCADE'
});
CustomerInteraction.belongsTo(Customer, {
  foreignKey: 'customerId',
  as: 'customer'
});

// Customer - Order relationships
Customer.hasMany(Order, {
  foreignKey: 'customerId',
  as: 'orders',
  onDelete: 'SET NULL'
});
Order.belongsTo(Customer, {
  foreignKey: 'customerId',
  as: 'customer'
});

// Customer - LoyaltyTransaction relationships
Customer.hasMany(LoyaltyTransaction, {
  foreignKey: 'customerId',
  as: 'loyaltyTransactions',
  onDelete: 'CASCADE'
});
LoyaltyTransaction.belongsTo(Customer, {
  foreignKey: 'customerId',
  as: 'customer'
});

// LoyaltyProgram - LoyaltyTransaction relationships
LoyaltyProgram.hasMany(LoyaltyTransaction, {
  foreignKey: 'programId',
  as: 'transactions',
  onDelete: 'CASCADE'
});
LoyaltyTransaction.belongsTo(LoyaltyProgram, {
  foreignKey: 'programId',
  as: 'program'
});

// Order - OrderItem relationships
Order.hasMany(OrderItem, {
  foreignKey: 'orderId',
  as: 'items',
  onDelete: 'CASCADE'
});
OrderItem.belongsTo(Order, {
  foreignKey: 'orderId',
  as: 'order'
});

// Product - OrderItem relationships
Product.hasMany(OrderItem, {
  foreignKey: 'productId',
  as: 'orderItems'
});
OrderItem.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product'
});

// Variant - OrderItem relationships
ProductVariant.hasMany(OrderItem, {
  foreignKey: 'variantId',
  as: 'variantOrderItems',
  onDelete: 'SET NULL'
});
OrderItem.belongsTo(ProductVariant, {
  foreignKey: 'variantId',
  as: 'variant'
});

// Order - OrderPayment relationships
Order.hasMany(OrderPayment, {
  foreignKey: 'orderId',
  as: 'payments',
  onDelete: 'CASCADE'
});
OrderPayment.belongsTo(Order, {
  foreignKey: 'orderId',
  as: 'order'
});

// Order - OrderShipment relationships
Order.hasMany(OrderShipment, {
  foreignKey: 'orderId',
  as: 'shipments',
  onDelete: 'CASCADE'
});
OrderShipment.belongsTo(Order, {
  foreignKey: 'orderId',
  as: 'order'
});

// POSession - POSTransaction relationships
POSSession.hasMany(POSTransaction, {
  foreignKey: 'sessionId',
  as: 'transactions',
  onDelete: 'CASCADE'
});
POSTransaction.belongsTo(POSSession, {
  foreignKey: 'sessionId',
  as: 'session'
});

// Campaign - CustomerSegment relationships (many-to-many through campaign targeting)
// Note: This would typically need a join table for proper many-to-many

// Promotion - Order relationships (through order discounts)
// Note: Track promotion usage in orders

// Account - JournalEntryLine relationships
Account.hasMany(JournalEntryLine, {
  foreignKey: 'accountId',
  as: 'journalLines'
});
JournalEntryLine.belongsTo(Account, {
  foreignKey: 'accountId',
  as: 'account'
});

// JournalEntry - JournalEntryLine relationships
JournalEntry.hasMany(JournalEntryLine, {
  foreignKey: 'journalEntryId',
  as: 'lines',
  onDelete: 'CASCADE'
});
JournalEntryLine.belongsTo(JournalEntry, {
  foreignKey: 'journalEntryId',
  as: 'journalEntry'
});

// Invoice - InvoiceItem relationships
Invoice.hasMany(InvoiceItem, {
  foreignKey: 'invoiceId',
  as: 'items',
  onDelete: 'CASCADE'
});
InvoiceItem.belongsTo(Invoice, {
  foreignKey: 'invoiceId',
  as: 'invoice'
});

// Invoice - InvoicePayment relationships
Invoice.hasMany(InvoicePayment, {
  foreignKey: 'invoiceId',
  as: 'payments',
  onDelete: 'CASCADE'
});
InvoicePayment.belongsTo(Invoice, {
  foreignKey: 'invoiceId',
  as: 'invoice'
});

// Report - ReportSnapshot relationships
Report.hasMany(ReportSnapshot, {
  foreignKey: 'reportId',
  as: 'snapshots',
  onDelete: 'CASCADE'
});
ReportSnapshot.belongsTo(Report, {
  foreignKey: 'reportId',
  as: 'report'
});

module.exports = {
  User,
  Role,
  Permission,
  RolePermission,
  Category,
  Brand,
  Product,
  ProductVariant,
  ProductImage,
  Warehouse,
  Inventory,
  StockMovement,
  Supplier,
  PurchaseOrder,
  PurchaseOrderItem,
  StockTransfer,
  StockTransferItem,
  Customer,
  CustomerAddress,
  CustomerInteraction,
  CustomerSegment,
  Order,
  OrderItem,
  OrderPayment,
  OrderShipment,
  POSession,
  POSTransaction,
  Campaign,
  Promotion,
  LoyaltyProgram,
  LoyaltyTransaction,
  Account,
  JournalEntry,
  JournalEntryLine,
  Invoice,
  InvoiceItem,
  InvoicePayment,
  TaxRate,
  Report,
  ReportSnapshot,
  AuditLog,
  SystemSetting,
  Notification
};
