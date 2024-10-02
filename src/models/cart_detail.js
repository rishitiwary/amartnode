'use strict';
module.exports = (sequelize, DataTypes) => {
  const Cart_Detail = sequelize.define('Cart_Detail', {
    orderId: DataTypes.STRING,
    // custId: DataTypes.INTEGER,
    addressId: DataTypes.INTEGER,
    productId: DataTypes.INTEGER,
    varientId: DataTypes.INTEGER,
    qty: DataTypes.INTEGER,
    status: DataTypes.ENUM('processing','shipping','delivered','cancel',"cancelRequest"),
    deliveryDate: DataTypes.DATE,
  }, {});
  Cart_Detail.associate = function(models) {
    // associations can be defined here
    models.Cart_Detail.belongsTo(models.Order, { foreignKey: 'orderId' });  

    models.Cart_Detail.hasOne(models.Address, {
      foreignKey: 'id',
      sourceKey: 'addressId',
      as: 'address'
    });

    models.Cart_Detail.hasOne(models.Order, {
      foreignKey: 'id',
      sourceKey: 'orderId',
      as: 'order'
    });
    

    models.Cart_Detail.hasOne(models.product, {
      foreignKey: 'id',
      sourceKey: 'productId',
      as: 'product_detail'
    });

    models.Cart_Detail.hasOne(models.product, {
      foreignKey: 'id',
      sourceKey: 'productId',
      as: 'product'
    });

    models.Cart_Detail.hasOne(models.ProductVariant, {
      foreignKey: 'id',
      sourceKey: 'varientId',
      as: 'varient'
    });

    models.Cart_Detail.hasOne(models.productphoto, {
      foreignKey: 'productId',
      sourceKey: 'productId',
      as: 'thumbnail'
    });

  };
  return Cart_Detail;
};