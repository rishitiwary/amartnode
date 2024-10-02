"use strict";
module.exports = (sequelize, DataTypes) => {
  const collection = sequelize.define(
    "collection",
    {
      name: DataTypes.STRING,
      slug: DataTypes.STRING,
      thumbnail: DataTypes.STRING,
      sequence: DataTypes.INTEGER,
      banner: DataTypes.STRING,
      title: DataTypes.STRING,
      keyword: DataTypes.TEXT,
      desc: DataTypes.TEXT,
    },
    {}
  );
  collection.associate = function (models) {
    // associations can be defined here
    models.collection.hasMany(models.item, { foreignKey: "collectionId" });
  };
  return collection;
};
