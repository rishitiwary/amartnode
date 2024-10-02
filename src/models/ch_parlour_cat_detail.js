'use strict';
module.exports = (sequelize, DataTypes) => {
  const ch_parlour_cat_detail = sequelize.define('ch_parlour_cat_detail', {
    SALONID: DataTypes.INTEGER,
    OWNERID: DataTypes.INTEGER,
    CAT_ID: DataTypes.INTEGER,
    SERVICEID: DataTypes.INTEGER
  }, {});
  ch_parlour_cat_detail.associate = function(models) {
    // associations can be defined here
  };
  return ch_parlour_cat_detail;
};