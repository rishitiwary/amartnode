"use strict";
module.exports = (sequelize, DataTypes) => {
  const tag = sequelize.define(
    "tag",
    {
      title: DataTypes.TEXT,
      status: DataTypes.BOOLEAN,
      productId: DataTypes.INTEGER,
    },
    {}
  );
  tag.associate = function (models) {
    // associations can be defined here
    models.tag.hasOne(models.product, {
      foreignKey: "id",
      sourceKey: "productId",
      as: "product",
    });
  };
  return tag;
};
