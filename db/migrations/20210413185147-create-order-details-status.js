'use strict';

const { query } = require('express');

module.exports = {
   /**
   * @typedef {import('sequelize').Sequelize} Sequelize
   * @typedef {import('sequelize').QueryInterface} QueryInterface
   */

  /**
   * @param {QueryInterface} queryInterface
   * @param {Sequelize} Sequelize
   * @returns
   */
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Order_Details_Statuses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      status: {
        type: Sequelize.BOOLEAN
      },
      custId: {
        type: Sequelize.INTEGER
      },
      orderId: {
        type: Sequelize.INTEGER
      },
      productId: {
        type: Sequelize.INTEGER
      },
      issue: {
        type: Sequelize.STRING
      },
      comment: {
        type: Sequelize.TEXT
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
    await queryInterface.addColumn('Cart_Details','status',{
      type:Sequelize.ENUM('processing','shipping','delivered','cancelRequest','cancel'),
      defaultValue: 'processing'
    })
    await queryInterface.addColumn('Cart_Details','deliveryDate',{
      type:Sequelize.DATE,
    })
  },
  down:async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Order_Details_Statuses');
    await queryInterface.removeColumn('Cart_Details','status');
    await queryInterface.removeColumn('Cart_Details','deliveryDate');
    await queryInterface.removeColumn('Orders','deliverydate');
    await queryInterface.removeColumn('Orders','status');
  }
};