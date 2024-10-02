module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('ProductVariants', 'colorCode');
      await queryInterface.addColumn('ProductVariants', 'slug', {
        type: Sequelize.STRING,
        after: "productName",
      });
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('ProductVariants', 'slug');
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }
};