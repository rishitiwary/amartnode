'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        'Addresses',
        'StreetAddress', {
          type: Sequelize.TEXT,
        }
      )])
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn(
        'Addresses',
        'StreetAddress'
      )])
  }
};
