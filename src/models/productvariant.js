"use strict";
module.exports = (sequelize, DataTypes) => {
  const ProductVariant = sequelize.define(
    "ProductVariant",
    {
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      actualPrice: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      distributorPrice: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      marginPer: {
        type: DataTypes.INTEGER,
        // allowNull:false,
      },
      buyerPrice: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      sellerPrice: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      unitSize: {
        type: DataTypes.INTEGER,
      },
      qty: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      discountPer: {
        type: DataTypes.INTEGER,
      },
      discount: {
        type: DataTypes.INTEGER,
      },
      marginPrice: {
        type: DataTypes.INTEGER,
      },
      total: {
        type: DataTypes.INTEGER,
      },
      netPrice: {
        type: DataTypes.INTEGER,
      },
      productName: {
        type: DataTypes.STRING,
      },
      slug: {
        type: DataTypes.STRING,
      },

      networkType: {
        type: DataTypes.STRING,
      },
      modelYear: {
        type: DataTypes.STRING,
      },
      osType: {
        type: DataTypes.STRING,
      },
      memory: {
        type: DataTypes.STRING,
      },
      screenSize: {
        type: DataTypes.STRING,
      },
      batteryCapacity: {
        type: DataTypes.STRING,
      },
      primaryCamera: {
        type: DataTypes.STRING,
      },
      secondaryCamera: {
        type: DataTypes.STRING,
      },
      simCount: {
        type: DataTypes.STRING,
      },
      interface: {
        type: DataTypes.STRING,
      },
      compatibility: {
        type: DataTypes.STRING,
      },
      storageSize: {
        type: DataTypes.INTEGER,
      },
      storageType: {
        type: DataTypes.INTEGER,
      },
      laptopType: {
        type: DataTypes.INTEGER,
      },
      graphicsMemory: {
        type: DataTypes.INTEGER,
      },
      osVersion: {
        type: DataTypes.INTEGER,
      },
      displayResolutionType: {
        type: DataTypes.INTEGER,
      },
      processorId: {
        type: DataTypes.INTEGER,
      },
      Available: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      productCode: {
        type: DataTypes.STRING(10),
        unique: true,
      },
      colorId: {
        type: DataTypes.INTEGER,
      },
      brandId: {
        type: DataTypes.INTEGER,
      },
      longDesc: {
        type: DataTypes.TEXT,
      },
      shortDesc: {
        type: DataTypes.TEXT,
      },
      thumbnail: {
        type: DataTypes.TEXT,
      },
      youTubeUrl: {
        type: DataTypes.TEXT,
      },
      stockType: {
        type: DataTypes.BOOLEAN,
      },
      internationalWarranty: {
        type: DataTypes.INTEGER,
      },
      refundable: {
        type: DataTypes.BOOLEAN,
      },
      qtyWarning: {
        type: DataTypes.INTEGER,
      },
      COD: {
        type: DataTypes.BOOLEAN,
      },
    },
    {}
  );
  ProductVariant.associate = function (models) {
    // associations can be defined here
    models.ProductVariant.belongsTo(models.product, {
      foreignKey: "productId",
    });
    models.ProductVariant.hasMany(models.productphoto, {
      foreignKey: "varientId",
    });

    models.ProductVariant.hasOne(models.ch_brand_detail, {
      foreignKey: "id",
      sourceKey: "brandId",
      as: "brand",
    });
    models.ProductVariant.hasOne(models.ch_color_detail, {
      foreignKey: "id",
      sourceKey: "colorId",
      as: "color",
    });
    models.ProductVariant.hasOne(models.processor, {
      foreignKey: "id",
      sourceKey: "processorId",
      as: "processor",
    });
  };
  return ProductVariant;
};
