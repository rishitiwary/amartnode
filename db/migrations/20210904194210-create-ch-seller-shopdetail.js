'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('ch_seller_shopdetails', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      SELLERID: {
        type: Sequelize.INTEGER
      },
      SHOPNAME: {
        type: Sequelize.STRING
      },
      THUMBNAIL: {
        type: Sequelize.STRING
      },
      PHONE: {
        type: Sequelize.STRING
      },
      ADDRESS: {
        type: Sequelize.TEXT
      },
      CITY: {
        type: Sequelize.STRING
      },
      DISTRICT: {
        type: Sequelize.STRING
      },
      ZONE: {
        type: Sequelize.STRING
      },
      PICKUPADDRESS: {
        type: Sequelize.TEXT
      },
      DESCRIPTION: {
        type: Sequelize.TEXT
      },
      BANKNAME: {
        type: Sequelize.TEXT
      },
      BANKACCOUNTNO: {
        type: Sequelize.DOUBLE
      },
      BANKACCOUNTHOLDERNAME: {
        type: Sequelize.STRING
      },
      BANKBRANCH: {
        type: Sequelize.STRING
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
    return queryInterface.dropTable('ch_seller_shopdetails');
  }
};