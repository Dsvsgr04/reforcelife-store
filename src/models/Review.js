const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Review = sequelize.define('Review', {
  id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  reviewerName: { type: DataTypes.STRING },
  rating:       { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
  comment:      { type: DataTypes.TEXT },
  verified:     { type: DataTypes.BOOLEAN, defaultValue: false },
  approved:     { type: DataTypes.BOOLEAN, defaultValue: true }
});

const ContactMessage = sequelize.define('ContactMessage', {
  id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  firstName: { type: DataTypes.STRING },
  lastName:  { type: DataTypes.STRING },
  email:     { type: DataTypes.STRING },
  subject:   { type: DataTypes.STRING },
  message:   { type: DataTypes.TEXT },
  read:      { type: DataTypes.BOOLEAN, defaultValue: false },
  replied:   { type: DataTypes.BOOLEAN, defaultValue: false }
});

module.exports = { Review, ContactMessage };
