import { db } from "../../../models";
export default {
  /* Add user api start here................................*/

  async index(req, res, next) {
    try {
      const { name, status } = req.body;
      db.location
        .findOne({ where: { name: name } })
        .then((data) => {
          if (data) {
            return db.location.update(
              { name: name, status: parseInt(status) ? "active" : "inactive" },
              { where: { id: data.id } }
            );
          }
          return db.location.create({
            name: name,
            status: parseInt(status) ? "active" : "inactive",
          });
        })
        .then((location) => {
          res
            .status(200)
            .json({ success: true, msg: "Successfully inserted location" });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  async List(req, res, next) {
    try {
      db.location
        .findAll()
        .then((list) => {
          res.status(200).json({ success: true, data: list });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  async getLocationDelete(req, res, next) {
    try {
      db.location
        .findOne({ where: { id: parseInt(req.query.id) } })
        .then((location) => {
          if (location) {
            return db.location.destroy({ where: { id: location.id } });
          }
          throw new RequestError("location is not found");
        })
        .then((re) => {
          return res
            .status(200)
            .json({ msg: "success", status: "deleted location Seccessfully" });
        })
        .catch((err) => {
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  async getLocationUpdate(req, res, next) {
    try {
      const { id, name, status } = req.body;
      db.location
        .findOne({ where: { id: parseInt(id) } })
        .then((location) => {
          if (location) {
            return db.location.update(
              {
                id: id,
                name: name,
                status: parseInt(status) ? "active" : "inactive",
              },
              { where: { id: location.id } }
            );
          }
          throw new RequestError("No data found");
        })
        .then((re) => {
          return res
            .status(200)
            .json({ msg: "success", status: "Update location Seccessfully" });
        })
        .catch((err) => {
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },
  //area list
  async areaCreate(req, res, next) {
    try {
      const { name, locationId, status } = req.body;
      db.area
        .findOne({ where: { name: name } })
        .then((data) => {
          if (data) {
            return db.area.update(
              {
                locationId: locationId,
                name: name,
                status: parseInt(status) ? "active" : "inactive",
              },
              { where: { id: data.id } }
            );
          }
          return db.area.create({
            locationId: locationId,
            name: name,
            status: parseInt(status) ? "active" : "inactive",
          });
        })
        .then((area) => {
          res
            .status(200)
            .json({ success: true, msg: "Successfully inserted area" });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  async cityList(req, res, next) {
    try {
      db.area
        .findAll({
          attributes: ["id", "name", "status"],
          include: [{ model: db.location, attributes: ["name"] }],
          order: [["createdAt", "DESC"]],
        })
        .then((list) => {
          res.status(200).json({ success: true, data: list });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError(err);
    }
  },
  async getAreaDeleteById(req, res, next) {
    try {
      db.area
        .findOne({ where: { id: parseInt(req.query.id) } })
        .then((area) => {
          if (area) {
            return db.area.destroy({ where: { id: area.id } });
          }
          throw new RequestError("area is not found");
        })
        .then((re) => {
          return res
            .status(200)
            .json({ msg: "success", status: "deleted area Seccessfully" });
        })
        .catch((err) => {
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },
  async getCityUpdate(req, res, next) {
    try {
      const { id, name, locationId, status } = req.body;
      db.area
        .findOne({ where: { id: id } })
        .then((data) => {
          if (data) {
            return db.area.update(
              {
                name: name ? name : data.name,
                locationId: locationId ? locationId : data.locationId,
                STATUS: status ? status : data.status,
              },
              { where: { id: data.id } }
            );
          }
          throw new RequestError("Area is not list");
        })
        .then((location) => {
          res.status(200).json({
            status: 200,
            success: true,
            message: "Successfully updated",
          });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError(err);
    }
  },
  async getAreaList(req, res, next) {
    try {
      db.area
        .findAll({
          where: { locationId: req.query.locationId },
          include: [{ model: db.location, attributes: ["id", "name"] }],
        })
        .then((list) => {
          res.status(200).json({ success: true, data: list });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  async getAreaListById(req, res, next) {
    try {
      db.area
        .findAll({
          where: { locationId: req.query.id },
          include: [{ model: db.location, attributes: ["id", "name"] }],
        })
        .then((list) => {
          res.status(200).json({ success: true, data: list });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  async cityCreate(req, res, next) {
    try {
      const { name, locationId, status } = req.body;
      db.area
        .findOne({ where: { name: name } })
        .then((data) => {
          if (data) {
            return db.area.update(
              {
                name: name,
                locationId: locationId,
                status: status,
              },
              { where: { id: data.id } }
            );
          }
          return db.area.create({
            name: name,
            locationId: ZONEID,
            status: true,
          });
        })
        .then((location) => {
          res.status(200).json({
            status: 200,
            success: true,
            message: "Successfully inserted area",
          });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError(err);
    }
  },

  async deleteCity(req, res, next) {
    try {
      const { id } = req.query;
      db.area
        .findOne({
          where: {
            id: id,
          },
        })
        .then((city) => {
          if (city) {
            return db.area.destroy({ where: { id: city.id } });
          }
          throw new RequestError("city is not found");
        })
        .then((re) => {
          return res.status(200).json({
            status: 200,
            success: true,
            message: "deleted city Seccessfully",
          });
        })
        .catch((err) => {
          next(err);
        });
    } catch (err) {
      throw new RequestError(err);
    }
  },
};
