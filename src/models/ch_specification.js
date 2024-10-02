'use strict';
module.exports = (sequelize, DataTypes) => {
  const ch_specification = sequelize.define('ch_specification', {
    productId: DataTypes.INTEGER,
    type: DataTypes.TEXT,
    value: DataTypes.TEXT
  }, {});
  ch_specification.associate = function(models) {
    // associations can be defined here
    models.ch_specification.belongsTo(models.product, { foreignKey: 'productId' });

  };
  return ch_specification;
};