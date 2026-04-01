const sequelize = require('../config/database');
const User = require('./User');
const Product = require('./Product');
const { Order, OrderItem } = require('./Order');
const { Review, ContactMessage } = require('./Review');

// Associations
User.hasMany(Order, { foreignKey: 'UserId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'UserId', as: 'user' });

Order.hasMany(OrderItem, { foreignKey: 'OrderId', as: 'items', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'OrderId' });
OrderItem.belongsTo(Product, { foreignKey: 'ProductId', as: 'product' });
Product.hasMany(OrderItem, { foreignKey: 'ProductId' });

Product.hasMany(Review, { foreignKey: 'ProductId', as: 'reviews' });
Review.belongsTo(Product, { foreignKey: 'ProductId' });
User.hasMany(Review, { foreignKey: 'UserId', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'UserId', as: 'user' });

module.exports = { sequelize, User, Product, Order, OrderItem, Review, ContactMessage };
