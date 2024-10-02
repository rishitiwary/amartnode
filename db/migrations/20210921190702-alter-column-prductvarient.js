module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('products', 'SellerId', {
        type: Sequelize.INTEGER,
        allowNull: true
      });
      await queryInterface.addColumn('products', 'LocalDeiveryCharge', {
        type: Sequelize.DOUBLE,
        allowNull: true
      });
      await queryInterface.addColumn('products', 'ZonalDeiveryCharge', {
        type: Sequelize.DOUBLE,
        allowNull: true
      });
      await queryInterface.addColumn('products', 'NationalDeiveryCharge', {
        type: Sequelize.DOUBLE,
        allowNull: true
      });
      await queryInterface.addColumn('products', 'WarrantyType', {
        type: Sequelize.ENUM('Local', 'No', 'International', '100% orginal', 'Brand', 'Seller'),
        defaultValue: '100% orginal'
      });
      await queryInterface.addColumn('products', 'WarrantyPeriod', {
        type: Sequelize.STRING,
        allowNull: true
      });
      await queryInterface.addColumn('products', 'PubilshStatus', {
        type: Sequelize.ENUM('Pending','Processing','Unpublished', 'Published'),
        defaultValue: 'Pending'
      });
      await queryInterface.addColumn('products', 'ShippingDays', {
        type: Sequelize.STRING,
        allowNull: true
      });
      await queryInterface.addColumn('products', 'HighLightDetail', {
        allowNull: true,
        type: Sequelize.JSON,
      });
      await queryInterface.addColumn('ProductVariants', 'colorId', {
        type: Sequelize.INTEGER,
        allowNull: true
      });
      await queryInterface.addColumn('ProductVariants', 'brandId', {
        type: Sequelize.INTEGER,
        allowNull: true
      });
      await queryInterface.addColumn('ProductVariants', 'longDesc', {
        type: Sequelize.TEXT,
        allowNull: true
      });
      await queryInterface.addColumn('ProductVariants', 'shortDesc', {
        type: Sequelize.TEXT,
        allowNull: true
      });
      await queryInterface.addColumn('ProductVariants', 'thumbnail', {
        type: Sequelize.TEXT,
        allowNull: true
      });
      await queryInterface.addColumn('ProductVariants', 'youTubeUrl', {
        type: Sequelize.TEXT,
        allowNull: true
      });
      await queryInterface.addColumn('ProductVariants', 'stockType', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: true
      });
      await queryInterface.addColumn('ProductVariants', 'refundable', {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: true
      });
      await queryInterface.addColumn('ProductVariants', 'qtyWarning', {
        type: Sequelize.INTEGER,
        allowNull: true
      });
      await queryInterface.addColumn('ProductVariants', 'COD', {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: true
      });
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('products', 'SellerId');
      await queryInterface.removeColumn('products', 'LocalDeiveryCharge');
      await queryInterface.removeColumn('products', 'ZonalDeiveryCharge');
      await queryInterface.removeColumn('products', 'NationalDeiveryCharge');
      await queryInterface.removeColumn('products', 'WarrantyType');
      await queryInterface.removeColumn('products', 'WarrantyPeriod');
      await queryInterface.removeColumn('products', 'PubilshStatus');
      await queryInterface.removeColumn('products', 'ShippingDays');
      await queryInterface.removeColumn('ProductVariants', 'colorId');
      await queryInterface.removeColumn('ProductVariants', 'brandId');
      await queryInterface.removeColumn('ProductVariants', 'longDesc');
      await queryInterface.removeColumn('ProductVariants', 'shortDesc');
      await queryInterface.removeColumn('ProductVariants', 'thumbnail');
      await queryInterface.removeColumn('ProductVariants', 'youTubeUrl');
      await queryInterface.removeColumn('ProductVariants', 'stockType');
      await queryInterface.removeColumn('ProductVariants', 'refundable');
      await queryInterface.removeColumn('ProductVariants', 'refundable');
      await queryInterface.removeColumn('ProductVariants', 'qtyWarning');
      await queryInterface.removeColumn('ProductVariants', 'COD');
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }
};