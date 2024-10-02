'use strict';
module.exports = (sequelize, DataTypes) => {
  const category = sequelize.define('category', {
    name: DataTypes.STRING,
    slug: DataTypes.STRING,
    status: DataTypes.BOOLEAN,
    thumbnail: DataTypes.STRING,
    title: DataTypes.STRING,
    keyword: DataTypes.STRING, 
    desc: DataTypes.TEXT
  }, {});
  category.associate = function(models) {
    // associations can be defined here
    models.category.hasMany(models.product, { foreignKey: 'categoryId' });
    models.category.hasMany(models.SubCategory, { foreignKey: 'categoryId' });
    models.category.hasMany(models.SubChildCategory, { foreignKey: 'categoryId' });
  };
  return category;
};