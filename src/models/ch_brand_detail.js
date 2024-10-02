"use strict";
module.exports = (sequelize, DataTypes) => {
  const ch_brand_detail = sequelize.define(
    "ch_brand_detail",
    {
      name: DataTypes.STRING,
      code: DataTypes.STRING,
      slug: DataTypes.STRING,
      status: DataTypes.BOOLEAN,
      thumbnail: DataTypes.STRING,
      DiscountPer: DataTypes.INTEGER,
      title: DataTypes.STRING,
      keyword: DataTypes.TEXT,
      desc: DataTypes.TEXT,
    },
    {}
  );
  ch_brand_detail.associate = function (models) {
    // associations can be defined here
    models.ch_brand_detail.hasMany(models.product, { foreignKey: "brandId" });
  };
  return ch_brand_detail;
};
