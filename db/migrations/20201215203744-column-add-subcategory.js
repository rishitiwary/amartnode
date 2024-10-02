'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        'SubCategories',
        'slug', {
        type: Sequelize.STRING,
      }
      )])
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn(
        'SubCategories',
        'slug'
      )])
  }
};
