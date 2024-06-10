'use strict';
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    hooks: {
      beforeCreate: async (user) => {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  });

  User.associate = function(models) {
    // associations can be defined here
    User.hasMany(models.Post, { foreignKey: 'userId' });
    User.belongsToMany(models.User, {
      as: 'Followers',
      through: 'Follows',
      foreignKey: 'followerId'
    });
    User.belongsToMany(models.User, {
      as: 'Following',
      through: 'Follows',
      foreignKey: 'followingId'
    });
  };

  return User;
};
