'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        'ProductVariants',
        'Available', {
          type: Sequelize.BOOLEAN,
        }
      )])
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn(
        'ProductVariants',
        'Available'
      )])
  }
};
