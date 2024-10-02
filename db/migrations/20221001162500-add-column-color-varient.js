module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn(
        "ProductVariants",
        "internationalWarranty",
        {
          type: Sequelize.INTEGER,
          after: "stockType",
        }
      );
      await queryInterface.addColumn("ch_color_details", "thumbnail", {
        type: Sequelize.TEXT,
        after: "STATUS",
      });
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn(
        "ProductVariants",
        "internationalWarranty"
      );
      await queryInterface.removeColumn("ch_color_details", "thumbnail");
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },
};
