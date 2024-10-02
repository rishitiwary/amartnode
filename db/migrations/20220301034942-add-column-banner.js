module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn("BannerDetails", "type", {
        type: Sequelize.ENUM,
        values: ["0", "1", "2", "3", "4"],
        comment: "0 (laptop), 1 (mobile), 2(deals), 3(single), 4(another)",
        after: "status",
      });
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn("BannerDetails", "type");
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },
};
