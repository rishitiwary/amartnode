'use strict';
module.exports = (sequelize, DataTypes) => {
  const Ch_Super_Category = sequelize.define('Ch_Super_Category', {
    Name: DataTypes.STRING,
    CategoryId: DataTypes.INTEGER,
    Slug: DataTypes.TEXT,
    Status: DataTypes.BOOLEAN,
    Sequence: DataTypes.INTEGER,
    Title: DataTypes.STRING,
    keyword: DataTypes.TEXT,
    description: DataTypes.TEXT
  });
  Ch_Super_Category.associate = function(models) {
    // associations can be defined here
    models.Ch_Super_Category.hasOne(models.category, {
      foreignKey: 'id',
      sourceKey: 'CategoryId',
      as: 'category'
    }); 
  };
  return Ch_Super_Category;
};