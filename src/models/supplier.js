'use strict';
module.exports = (sequelize, DataTypes) => {
  const supplier = sequelize.define('supplier', {
    storename: DataTypes.STRING,
    status: DataTypes.INTEGER,
    shopaddress: DataTypes.TEXT,
    shopdesc: DataTypes.TEXT,
    ownername: DataTypes.STRING,
    owneraddress: DataTypes.TEXT,
    email: DataTypes.STRING,
    phone: DataTypes.TEXT,
    areaId: DataTypes.INTEGER,
  }, {});
  supplier.associate = function(models) {
    // associations can be defined here
    models.supplier.belongsTo(models.area, { foreignKey: 'areaId' });
  };
  return supplier;
};