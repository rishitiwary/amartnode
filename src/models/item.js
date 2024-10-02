"use strict";
module.exports = (sequelize, DataTypes) => {
  const item = sequelize.define(
    "item",
    {
      collectionId: DataTypes.INTEGER,
      name: DataTypes.STRING,
      slug: DataTypes.STRING,
      thumbnail: DataTypes.STRING,
      title: DataTypes.STRING,
      keyword: DataTypes.TEXT,
      desc: DataTypes.TEXT,
    },
    {}
  );
  item.associate = function (models) {
    // associations can be defined here
    models.item.belongsTo(models.collection, { foreignKey: "collectionId" });
  };
  return item;
};
