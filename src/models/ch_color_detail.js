"use strict";
module.exports = (sequelize, DataTypes) => {
  const ch_color_detail = sequelize.define(
    "ch_color_detail",
    {
      TITLE: DataTypes.STRING,
      CODE: DataTypes.TEXT,
      STATUS: DataTypes.BOOLEAN,
      thumbnail: {
        type: DataTypes.TEXT,
      },
    },
    {}
  );
  ch_color_detail.associate = function (models) {
    // associations can be defined here
  };
  return ch_color_detail;
};
