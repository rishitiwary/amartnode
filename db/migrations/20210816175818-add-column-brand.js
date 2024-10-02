module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('ch_brand_details', 'title', {
        type: Sequelize.STRING
      });
      await queryInterface.addColumn('ch_brand_details', 'keyword', {
        type: Sequelize.TEXT
      });
      await queryInterface.addColumn('ch_brand_details', 'desc', {
        type: Sequelize.TEXT
      });
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('ch_brand_details', 'title');
      await queryInterface.removeColumn('ch_brand_details', 'keyword');
      await queryInterface.removeColumn('ch_brand_details', 'desc');
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }
};