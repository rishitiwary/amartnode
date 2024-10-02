'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        'productphotos',
        'varientId', {
          type: Sequelize.INTEGER,
        }
      )])
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn(
        'productphotos',
        'varientId'
      )])
  }
};
