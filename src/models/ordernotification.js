'use strict';
module.exports = (sequelize, DataTypes) => {
  const OrderNotification = sequelize.define('OrderNotification', {
    orderId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER
  }, {});
  OrderNotification.associate = function (models) {
    // associations can be defined here
    models.OrderNotification.hasOne(models.Order, {
      foreignKey: 'id',
      sourceKey: 'orderId',
      as: 'order'
    });

    models.OrderNotification.hasOne(models.Cart_Detail, {
      foreignKey: 'orderId',
      sourceKey: 'orderId',
      as: 'details'
    });
  };
  return OrderNotification;
};