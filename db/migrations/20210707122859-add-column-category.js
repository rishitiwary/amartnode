module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('categories', 'title', {
        type: Sequelize.STRING
      });
      await queryInterface.addColumn('categories', 'keyword', {
        type: Sequelize.STRING
      });
      await queryInterface.addColumn('categories', 'desc', {
        type: Sequelize.TEXT
      });
      await queryInterface.addColumn('SubCategories', 'title', {
        type: Sequelize.STRING
      });
      await queryInterface.addColumn('SubCategories', 'keyword', {
        type: Sequelize.STRING
      });
      await queryInterface.addColumn('SubCategories', 'desc', {
        type: Sequelize.TEXT
      });
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('categories', 'title');
      await queryInterface.removeColumn('categories', 'keyword');
      await queryInterface.removeColumn('categories', 'desc');
      await queryInterface.removeColumn('SubCategories', 'title');
      await queryInterface.removeColumn('SubCategories', 'keyword');
      await queryInterface.removeColumn('SubCategories', 'desc');
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }
};