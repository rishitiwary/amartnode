'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        'categories',
        'status', {
          type: Sequelize.BOOLEAN,
        },
        
      ),
      queryInterface.addColumn(
        'categories',
        'thumbnail', {
          type: Sequelize.STRING,
        }
      )])
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn(
        'categories',
        'status',
      ),queryInterface.removeColumn(
        'categories',
        'thumbnail',
      )])
  }
};
