"use strict";
module.exports = (sequelize, DataTypes) => {
  const ch_seller_shopdetail = sequelize.define(
    "ch_seller_shopdetail",
    {
      SELLERID: DataTypes.INTEGER,
      SHOPNAME: DataTypes.STRING,
      THUMBNAIL: DataTypes.STRING,
      PHONE: DataTypes.STRING,
      ADDRESS: DataTypes.TEXT,
      CITY: DataTypes.STRING,
      DISTRICT: DataTypes.STRING,
      ZONE: DataTypes.STRING,
      PICKUPADDRESS: DataTypes.TEXT,
      DESCRIPTION: DataTypes.TEXT,
      BANKNAME: DataTypes.TEXT,
      BANKACCOUNTNO: DataTypes.DOUBLE,
      BANKACCOUNTHOLDERNAME: DataTypes.STRING,
      BANKBRANCH: DataTypes.STRING,
    },
    {}
  );
  ch_seller_shopdetail.associate = function (models) {
    // associations can be defined here
    models.ch_seller_shopdetail.belongsTo(models.user, {
      foreignKey: "SELLERID",
    });
  };
  return ch_seller_shopdetail;
};
