'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('ch_cities', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      TITLE: {
        type: Sequelize.STRING
      },
      DISTRICTID: {
        type: Sequelize.INTEGER
      },
      ZONEID: {
        type: Sequelize.INTEGER
      },
      STATEID: {
        type: Sequelize.INTEGER
      },
      STATUS: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('ch_cities');
  }
};