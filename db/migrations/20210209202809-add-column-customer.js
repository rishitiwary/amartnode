'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        'customers',
        'verf_key', {
          type: Sequelize.STRING,
        }
      )])
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn(
        'customers',
        'verf_key'
      )])
  }
};
