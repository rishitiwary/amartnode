"use strict";
module.exports = (sequelize, DataTypes) => {
  const ch_flash_sale_item = sequelize.define(
    "ch_flash_sale_item",
    {
      flashSaleId: DataTypes.INTEGER,
      status: DataTypes.INTEGER,
      productId: DataTypes.INTEGER,
    },
    {}
  );
  ch_flash_sale_item.associate = function (models) {
    // associations can be defined here
    models.ch_flash_sale_item.belongsTo(models.ch_flash_sale, {
      foreignKey: "flashSaleId",
      as: "flashSaleItem",
    });

    models.ch_flash_sale_item.hasOne(models.product, {
      foreignKey: "id",
      sourceKey: "productId",
      as: "productList",
    });
  };
  return ch_flash_sale_item;
};
