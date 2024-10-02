"use strict";
module.exports = (sequelize, DataTypes) => {
  const product = sequelize.define(
    "product",
    {
      categoryId: DataTypes.INTEGER,
      subCategoryId: DataTypes.INTEGER,
      childCategoryId: DataTypes.INTEGER,
      name: DataTypes.STRING,
      slug: DataTypes.STRING,
      condition: DataTypes.INTEGER,
      brandId: DataTypes.INTEGER,
      status: DataTypes.STRING,
      photo: DataTypes.STRING,
      desc: DataTypes.TEXT,
      SellerId: DataTypes.INTEGER,
      LocalDeiveryCharge: DataTypes.DOUBLE,
      ZonalDeiveryCharge: DataTypes.DOUBLE,
      NationalDeiveryCharge: DataTypes.DOUBLE,
      WarrantyType: {
        type: DataTypes.ENUM(
          "Local",
          "No",
          "International",
          "100% orginal",
          "Brand",
          "Seller"
        ),
        allowNull: false,
        defaultValue: "100% orginal",
      },
      WarrantyPeriod: DataTypes.STRING,
      PubilshStatus: {
        type: DataTypes.ENUM(
          "Pending",
          "Processing",
          "Unpublished",
          "Published"
        ),
        allowNull: false,
        defaultValue: "pending",
      },
      ShippingDays: DataTypes.STRING,
      HighLightDetail: DataTypes.JSON,
    },
    {}
  );
  product.associate = function (models) {
    // associations can be defined here
    models.product.belongsTo(models.SubCategory, {
      foreignKey: "subCategoryId",
    });
    models.product.hasMany(models.productphoto, { foreignKey: "productId" });
    models.product.belongsTo(models.SubChildCategory, {
      foreignKey: "childCategoryId",
    });
    models.product.hasMany(models.vendor_product, { foreignKey: "productId" });
    models.product.hasMany(models.ProductVariant, { foreignKey: "productId" });
    models.product.hasMany(models.Seo_Details, { foreignKey: "productId" });
    models.product.belongsTo(models.ch_brand_detail, { foreignKey: "brandId" });
    models.product.hasMany(models.ch_specification, {
      foreignKey: "productId",
    });

    models.product.hasOne(models.category, {
      foreignKey: "id",
      sourceKey: "categoryId",
      as: "maincat",
    });
    models.product.hasOne(models.user, {
      foreignKey: "id",
      sourceKey: "SellerId",
      as: "users",
    });
  };
  return product;
};
