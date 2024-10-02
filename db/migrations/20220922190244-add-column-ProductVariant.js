module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn("ProductVariants", "networkType", {
        type: Sequelize.STRING,
        after: "slug",
      });
      await queryInterface.addColumn("ProductVariants", "modelYear", {
        type: Sequelize.STRING,
        after: "slug",
      });
      await queryInterface.addColumn("ProductVariants", "osType", {
        type: Sequelize.STRING,
        after: "slug",
      });
      await queryInterface.addColumn("ProductVariants", "memory", {
        type: Sequelize.STRING,
        after: "slug",
      });
      await queryInterface.addColumn("ProductVariants", "screenSize", {
        type: Sequelize.STRING,
        after: "slug",
      });
      await queryInterface.addColumn("ProductVariants", "batteryCapacity", {
        type: Sequelize.STRING,
        after: "slug",
      });
      await queryInterface.addColumn("ProductVariants", "primaryCamera", {
        type: Sequelize.STRING,
        after: "slug",
      });
      await queryInterface.addColumn("ProductVariants", "secondaryCamera", {
        type: Sequelize.STRING,
        after: "slug",
      });
      await queryInterface.addColumn("ProductVariants", "simCount", {
        type: Sequelize.STRING,
        after: "slug",
      });
      await queryInterface.addColumn("ProductVariants", "interface", {
        type: Sequelize.STRING,
        after: "slug",
      });
      await queryInterface.addColumn("ProductVariants", "compatibility", {
        type: Sequelize.STRING,
        after: "slug",
      });
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn("ProductVariants", "networkType");
      await queryInterface.removeColumn("ProductVariants", "osType");
      await queryInterface.removeColumn("ProductVariants", "modelYear");
      await queryInterface.removeColumn("ProductVariants", "memory");
      await queryInterface.removeColumn("ProductVariants", "screenSize");
      await queryInterface.removeColumn("ProductVariants", "batteryCapacity");
      await queryInterface.removeColumn("ProductVariants", "primaryCamera");
      await queryInterface.removeColumn("ProductVariants", "secondaryCamera");
      await queryInterface.removeColumn("ProductVariants", "simCount");
      await queryInterface.removeColumn("ProductVariants", "interface");
      await queryInterface.removeColumn("ProductVariants", "compatibility");
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },
};
