module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('users', 'attempt', {
        type: Sequelize.INTEGER
      });
      await queryInterface.addColumn('users', 'loggedOutAt', {
        type: Sequelize.DATE
      });
      await queryInterface.addColumn('customers', 'attempt', {
        type: Sequelize.INTEGER
      });
      await queryInterface.addColumn('customers', 'loggedOutAt', {
        type: Sequelize.DATE
      });
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('users', 'attempt');
      await queryInterface.removeColumn('users', 'loggedOutAt');
      await queryInterface.removeColumn('customers', 'attempt');
      await queryInterface.removeColumn('customers', 'loggedOutAt');
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }
};