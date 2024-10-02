'use strict';
module.exports = (sequelize, DataTypes) => {
  const Seo_Details = sequelize.define('Seo_Details', {
    productId: DataTypes.INTEGER,
    meta_title: DataTypes.STRING,
    meta_keyword: DataTypes.TEXT,
    meta_desc: DataTypes.TEXT
  }, {});
  Seo_Details.associate = function(models) {
    // associations can be defined here
    models.Seo_Details.belongsTo(models.product, { foreignKey: 'productId' });
  };
  return Seo_Details;
};