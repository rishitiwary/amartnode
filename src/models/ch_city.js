'use strict';
module.exports = (sequelize, DataTypes) => {
  const ch_city = sequelize.define('ch_city', {
    TITLE: DataTypes.STRING,
    DISTRICTID: DataTypes.INTEGER,
    ZONEID: DataTypes.INTEGER,
    STATEID: DataTypes.INTEGER,
    STATUS: DataTypes.BOOLEAN
  }, {});
  ch_city.associate = function(models) {
    // associations can be defined here
    models.ch_city.hasOne(models.location, {
      foreignKey: 'id',
      sourceKey: 'ZONEID',
      as: 'zone'
    }); 
  };
  return ch_city;
};