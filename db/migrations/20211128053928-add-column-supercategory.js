module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('Ch_Super_Categories', 'Sequence', {
        type: Sequelize.INTEGER,
        after: "Slug",
      });
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('Ch_Super_Categories', 'Sequence');
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }
};