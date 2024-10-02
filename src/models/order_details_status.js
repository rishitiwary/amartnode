'use strict';
module.exports = (sequelize, DataTypes) => {
  const Order_Details_Status = sequelize.define('Order_Details_Status', {
    status: DataTypes.BOOLEAN,
    custId: DataTypes.INTEGER,
    orderId: DataTypes.INTEGER,
    productId: DataTypes.INTEGER,
    issue: DataTypes.STRING,
    comment: DataTypes.TEXT
  }, {});
  Order_Details_Status.associate = function(models) {
    // associations can be defined here
  };
  return Order_Details_Status;
};