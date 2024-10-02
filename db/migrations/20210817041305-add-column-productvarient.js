module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('ProductVariants', 'actualPrice', {
        type: Sequelize.DOUBLE
      });
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('ProductVariants', 'actualPrice');
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }
};