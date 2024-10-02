'use strict';
module.exports = (sequelize, DataTypes) => {
  const chit_seller_contact = sequelize.define('chit_seller_contact', {
    FULLNAME: DataTypes.STRING,
    EMAIL: DataTypes.STRING,
    PHONENO: DataTypes.STRING,
    MESSAGE: DataTypes.TEXT
  }, {});
  chit_seller_contact.associate = function(models) {
    // associations can be defined here
  };
  return chit_seller_contact;
};