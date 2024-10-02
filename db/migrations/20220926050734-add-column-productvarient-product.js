module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn("products", "condition", {
        type: Sequelize.INTEGER,
        after: "slug",
      });
      await queryInterface.addColumn("ProductVariants", "storageSize", {
        type: Sequelize.INTEGER,
        after: "compatibility",
      });
      await queryInterface.addColumn("ProductVariants", "storageType", {
        type: Sequelize.INTEGER,
        after: "storageSize",
      });
      await queryInterface.addColumn(
        "ProductVariants",
        "displayResolutionType",
        {
          type: Sequelize.INTEGER,
          after: "storageType",
        }
      );
      await queryInterface.addColumn("ProductVariants", "laptopType", {
        type: Sequelize.INTEGER,
        after: "displayResolutionType",
      });
      await queryInterface.addColumn("ProductVariants", "graphicsMemory", {
        type: Sequelize.INTEGER,
        after: "laptopType",
      });
      await queryInterface.addColumn("ProductVariants", "osVersion", {
        type: Sequelize.INTEGER,
        after: "laptopType",
      });
      await queryInterface.addColumn("ProductVariants", "processorId", {
        type: Sequelize.INTEGER,
        after: "osVersion",
      });
      await queryInterface.addColumn("ch_brand_details", "thumbnail", {
        type: Sequelize.STRING,
        after: "status",
      });
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn("products", "condition");
      await queryInterface.removeColumn("ProductVariants", "storageSize");
      await queryInterface.removeColumn("ProductVariants", "storageType");
      await queryInterface.removeColumn(
        "ProductVariants",
        "displayResolutionType"
      );
      await queryInterface.removeColumn("ProductVariants", "laptopType");
      await queryInterface.removeColumn("ProductVariants", "graphicsMemory");
      await queryInterface.removeColumn("ProductVariants", "osVersion");
      await queryInterface.removeColumn("ProductVariants", "processorId");
      await queryInterface.removeColumn("ch_brand_details", "thumbnail");
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },
};
