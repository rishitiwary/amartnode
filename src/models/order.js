'use strict';
module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    custId: DataTypes.INTEGER,
    addressId: DataTypes.INTEGER,
    number: DataTypes.STRING,
    paymentmethod: DataTypes.STRING,
    // deliverydate: DataTypes.DATE,
    grandtotal: DataTypes.INTEGER,
    // status: DataTypes.ENUM('processing','shipping','delieverd','cancel',"cancelRequest"),
  }, {});
  Order.associate = function(models) {
    // associations can be defined here
    models.Order.hasMany(models.Cart_Detail, { foreignKey: 'orderId' });
    models.Order.hasMany(models.Address, { foreignKey: 'orderId' });
   
    models.Order.hasOne(models.customer, {
      foreignKey: 'id',
      sourceKey: 'custId',
      as: 'user'
    }); 

    models.Order.hasOne(models.Address, {
      foreignKey: 'id',
      sourceKey: 'addressId',
      as: 'address'
    });

  };
  return Order;
};