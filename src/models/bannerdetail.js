"use strict";
module.exports = (sequelize, DataTypes) => {
  const BannerDetail = sequelize.define(
    "BannerDetail",
    {
      banner: DataTypes.TEXT,
      slug: DataTypes.STRING,
      status: DataTypes.BOOLEAN,
      type: {
        type: DataTypes.ENUM("laptop", "mobile", "deals", "single", "another"),
        allowNull: false,
      },
    },
    {}
  );
  BannerDetail.associate = function (models) {
    // associations can be defined here
  };
  return BannerDetail;
};
