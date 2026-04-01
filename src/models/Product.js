const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id:                  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name:                { type: DataTypes.STRING, allowNull: false },
  description:         { type: DataTypes.TEXT },
  shortDescription:    { type: DataTypes.TEXT },
  price:               { type: DataTypes.DECIMAL(10,2), allowNull: false },
  salePrice:           { type: DataTypes.DECIMAL(10,2) },
  imageUrl:            { type: DataTypes.STRING },
  additionalImages:    { type: DataTypes.JSON, defaultValue: [] },
  category:            { type: DataTypes.ENUM(
    'DIGESTION','METABOLISM','IMMUNITY','ENERGY','ANTI_INFLAMMATORY',
    'DETOX','WEIGHT_MANAGEMENT','HEART_HEALTH','BRAIN_HEALTH','GENERAL_WELLNESS'
  )},
  stockQuantity:       { type: DataTypes.INTEGER, defaultValue: 0 },
  inStock:             { type: DataTypes.BOOLEAN, defaultValue: true },
  featured:            { type: DataTypes.BOOLEAN, defaultValue: false },
  active:              { type: DataTypes.BOOLEAN, defaultValue: true },
  averageRating:       { type: DataTypes.DECIMAL(3,1), defaultValue: 0.0 },
  totalReviews:        { type: DataTypes.INTEGER, defaultValue: 0 },
  servingSize:         { type: DataTypes.STRING },
  servingsPerContainer:{ type: DataTypes.STRING },
  ingredients:         { type: DataTypes.TEXT },
  keyBenefits:         { type: DataTypes.JSON, defaultValue: [] },
  sku:                 { type: DataTypes.STRING, unique: true },
  weight:              { type: DataTypes.FLOAT }
});

module.exports = Product;
