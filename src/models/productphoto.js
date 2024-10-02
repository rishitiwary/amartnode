'use strict';
module.exports = (sequelize, DataTypes) => {
  const productphoto = sequelize.define('productphoto', {
    productId: DataTypes.INTEGER,
    imgUrl: DataTypes.STRING,
    varientId: DataTypes.INTEGER
  }, {});
  productphoto.associate = function(models) {
    // associations can be defined here
    models.productphoto.belongsTo(models.product, { foreignKey: 'productId' });
    models.productphoto.belongsTo(models.ProductVariant, { foreignKey: 'varientId' });

  };
  return productphoto;
};