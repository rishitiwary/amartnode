'use strict';
module.exports = (sequelize, DataTypes) => {
  const ch_coupon_detail = sequelize.define('ch_coupon_detail', {
    Code: DataTypes.STRING,
    VarientId: DataTypes.INTEGER,
    StartDate: DataTypes.DATE,
    EndDate: DataTypes.DATE,
    Type: DataTypes.INTEGER,
    Value: DataTypes.DOUBLE,
    Status: DataTypes.BOOLEAN
  }, {});
  ch_coupon_detail.associate = function(models) {
    // associations can be defined here
    models.ch_coupon_detail.hasOne(models.ProductVariant, {
      foreignKey: 'id',
      sourceKey: 'VarientId',
      as: 'product'
    }); 
  };
  return ch_coupon_detail;
};