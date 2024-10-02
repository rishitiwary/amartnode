module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('ch_brand_details', 'DiscountPer', {
        type: Sequelize.INTEGER,
        after: "status",
      });
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('ch_brand_details', 'DiscountPer');
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }
};