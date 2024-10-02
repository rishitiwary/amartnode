'use strict';
module.exports = (sequelize, DataTypes) => {
  const processor = sequelize.define('processor', {
    name: DataTypes.STRING,
    type: DataTypes.STRING,
    title: DataTypes.STRING,
    desc: DataTypes.TEXT,
    keyword: DataTypes.STRING
  }, {});
  processor.associate = function(models) {
    // associations can be defined here
  };
  return processor;
};