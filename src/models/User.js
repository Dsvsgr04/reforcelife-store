const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName:  { type: DataTypes.STRING, allowNull: false },
  email:     { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  password:  { type: DataTypes.STRING, allowNull: false },
  phone:     { type: DataTypes.STRING },
  role:      { type: DataTypes.ENUM('user', 'admin'), defaultValue: 'user' },
  enabled:   { type: DataTypes.BOOLEAN, defaultValue: true }
});

// Hash password before save
User.beforeSave(async (user) => {
  if (user.changed('password')) {
    user.password = await bcrypt.hash(user.password, 12);
  }
});

User.prototype.comparePassword = async function(plain) {
  return bcrypt.compare(plain, this.password);
};

User.prototype.toSafeObject = function() {
  const { password, ...safe } = this.toJSON();
  return safe;
};

module.exports = User;
