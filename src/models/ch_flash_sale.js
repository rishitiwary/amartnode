"use strict";
module.exports = (sequelize, DataTypes) => {
  const ch_flash_sale = sequelize.define(
    "ch_flash_sale",
    {
      title: DataTypes.STRING,
      slug: DataTypes.STRING,
      status: DataTypes.INTEGER,
      thumbnail: DataTypes.STRING,
      startDate: DataTypes.DATE,
      endDate: DataTypes.DATE,
    },
    {}
  );
  ch_flash_sale.associate = function (models) {
    // associations can be defined here
    models.ch_flash_sale.hasMany(models.ch_flash_sale_item, {
      foreignKey: "flashSaleId",
      as: "flashSaleItem",
    });
  };
  return ch_flash_sale;
};
