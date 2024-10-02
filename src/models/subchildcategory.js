"use strict";
module.exports = (sequelize, DataTypes) => {
  const SubChildCategory = sequelize.define(
    "SubChildCategory",
    {
      name: DataTypes.STRING,
      slug: DataTypes.STRING,
      categoryId: DataTypes.INTEGER,
      subcategoryId: DataTypes.INTEGER,
      title: DataTypes.STRING,
      keyword: DataTypes.TEXT,
      desc: DataTypes.TEXT,
    },
    {}
  );
  SubChildCategory.associate = function (models) {
    // associations can be defined here
    models.SubChildCategory.belongsTo(models.SubCategory, {
      foreignKey: "subcategoryId",
    });
    models.SubChildCategory.hasMany(models.product, {
      foreignKey: "childCategoryId",
    });

    models.SubChildCategory.hasOne(models.category, {
      foreignKey: "id",
      sourceKey: "categoryId",
      as: "category",
    });
  };
  return SubChildCategory;
};
