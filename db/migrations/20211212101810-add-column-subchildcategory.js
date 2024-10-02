module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn("SubChildCategories", "title", {
        type: Sequelize.STRING,
        after: "subcategoryId",
      });
      await queryInterface.addColumn("SubChildCategories", "keyword", {
        type: Sequelize.TEXT,
        after: "title",
      });
      await queryInterface.addColumn("SubChildCategories", "desc", {
        type: Sequelize.TEXT,
        after: "keyword",
      });
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn("SubChildCategories", "title");
      await queryInterface.removeColumn("SubChildCategories", "keyword");
      await queryInterface.removeColumn("SubChildCategories", "desc");

      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },
};
