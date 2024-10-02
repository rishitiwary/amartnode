'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
			queryInterface.addColumn(
				'products',
				'slug', {
					type: Sequelize.STRING,
				}
			)])
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
			queryInterface.removeColumn(
				'products',
				'slug'
			)])
  }
};