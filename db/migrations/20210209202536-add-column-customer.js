'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        'customers',
        'verify', {
          type: Sequelize.BOOLEAN,
        },
        'verf_key', {
          type: Sequelize.STRING,
        }
      )])
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn(
        'customers',
        'verify',
        'verf_key'
      )])
  }
};
