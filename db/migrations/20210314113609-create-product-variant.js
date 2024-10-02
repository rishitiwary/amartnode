'use strict';
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
    await queryInterface.createTable('ProductVariants', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      productId:{
        type:Sequelize.INTEGER,
        references:{
          model:"products"
        }
      },
      productCode: {
        type: Sequelize.STRING(10),
        unique: true,
        allowNull:false,
      },
      distributorPrice: {
        type: Sequelize.DOUBLE,
        allowNull:false,
      },
      marginPer: {
        type: Sequelize.INTEGER,
        // allowNull:false,
      },
      marginPrice: {
        type: Sequelize.DOUBLE,
        // allowNull:false,
      },
      buyerPrice: {
        type: Sequelize.DOUBLE,
        allowNull:false,
      },
      sellerPrice:{
        type:Sequelize.DOUBLE,
        allowNull:false
      },
      unitSize:{
        type:Sequelize.STRING,
      },
      qty:{
        type: Sequelize.INTEGER,
        allowNull:false, 
      },
      colorCode:{
        type:Sequelize.STRING,
      },
      discountPer:{
        type: Sequelize.INTEGER,
      },
      discount:{
        type: Sequelize.DOUBLE,
      },
      total:{
        type: Sequelize.DOUBLE,
      },
      netPrice:{
        type: Sequelize.INTEGER,
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
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ProductVariants');
  }
};