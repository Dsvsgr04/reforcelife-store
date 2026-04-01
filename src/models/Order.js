const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id:                  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  orderNumber:         { type: DataTypes.STRING, unique: true, allowNull: false },
  guestEmail:          { type: DataTypes.STRING },
  guestName:           { type: DataTypes.STRING },
  // Shipping
  shippingFirstName:   { type: DataTypes.STRING },
  shippingLastName:    { type: DataTypes.STRING },
  shippingAddress1:    { type: DataTypes.STRING },
  shippingAddress2:    { type: DataTypes.STRING },
  shippingCity:        { type: DataTypes.STRING },
  shippingState:       { type: DataTypes.STRING },
  shippingZip:         { type: DataTypes.STRING },
  shippingCountry:     { type: DataTypes.STRING, defaultValue: 'US' },
  shippingPhone:       { type: DataTypes.STRING },
  // Pricing
  subtotal:            { type: DataTypes.DECIMAL(10,2) },
  shippingCost:        { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
  taxAmount:           { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
  discountAmount:      { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
  totalAmount:         { type: DataTypes.DECIMAL(10,2) },
  // Payment
  paymentMethod:       { type: DataTypes.ENUM('PAYPAL','SQUARE','CREDIT_CARD'), defaultValue: 'PAYPAL' },
  paymentStatus:       { type: DataTypes.ENUM('PENDING','COMPLETED','FAILED','REFUNDED'), defaultValue: 'PENDING' },
  paymentTransactionId:{ type: DataTypes.STRING },
  // Status
  status: { type: DataTypes.ENUM(
    'PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED','REFUNDED'
  ), defaultValue: 'PENDING' },
  trackingNumber:      { type: DataTypes.STRING },
  notes:               { type: DataTypes.TEXT }
});

const OrderItem = sequelize.define('OrderItem', {
  id:              { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  quantity:        { type: DataTypes.INTEGER, allowNull: false },
  unitPrice:       { type: DataTypes.DECIMAL(10,2), allowNull: false },
  totalPrice:      { type: DataTypes.DECIMAL(10,2), allowNull: false },
  productName:     { type: DataTypes.STRING },
  productImageUrl: { type: DataTypes.STRING }
});

module.exports = { Order, OrderItem };
