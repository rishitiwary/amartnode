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
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await Promise.all([
      queryInterface.removeColumn('products', 'unitSize'),
      queryInterface.removeColumn('products', 'buyerPrice'),
      queryInterface.removeColumn('products', 'price'),
      queryInterface.removeColumn('products', 'qty'),
      queryInterface.removeColumn('products', 'discountPer'),
      queryInterface.removeColumn('products', 'discount'),
      queryInterface.removeColumn('products', 'total'),
      queryInterface.removeColumn('products', 'netPrice')
    ]);
  },
// unitSize: DataTypes.STRING,
    // buyerPrice: DataTypes.INTEGER,
    // price: DataTypes.INTEGER,
    // qty: DataTypes.INTEGER,
    // discountPer: DataTypes.INTEGER,
    // discount: DataTypes.INTEGER,
    // total: DataTypes.INTEGER,
    // netPrice: DataTypes.INTEGER,
     /**
   * @typedef {import('sequelize').Sequelize} Sequelize
   * @typedef {import('sequelize').QueryInterface} QueryInterface
   */

  /**
   * @param {QueryInterface} queryInterface
   * @param {Sequelize} Sequelize
   * @returns
   */
  down: async (queryInterface, Sequelize) => {
    await Promise.all([
    queryInterface.addColumn('products', 'unitSize',Sequelize.STRING),
    queryInterface.addColumn('products', 'buyerPrice',Sequelize.INTEGER),
    queryInterface.addColumn('products', 'price',Sequelize.INTEGER),
    queryInterface.addColumn('products', 'qty',Sequelize.INTEGER),
    queryInterface.addColumn('products', 'discountPer',Sequelize.INTEGER),
    queryInterface.addColumn('products', 'discount',Sequelize.INTEGER),
    queryInterface.addColumn('products', 'total',Sequelize.INTEGER),
    queryInterface.addColumn('products', 'netPrice',Sequelize.INTEGER)
  ]);

    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
