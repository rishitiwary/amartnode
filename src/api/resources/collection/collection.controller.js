import { db } from "../../../models";
const Util = require("../../../helpers/Util");
import config from "../../../config";
import AWS from "aws-sdk";
const s3 = new AWS.S3({
  accessKeyId: config.app.AWS_ACCESS_KEY,
  secretAccessKey: config.app.AWS_SECRET_KEY,
});

const deleteFileFromS3 = async (imgUrl) => {
  try {
    const lastItem = imgUrl.substring(imgUrl.lastIndexOf("/") + 1);
    var params = {
      Bucket: "grociproduct",
      Key: lastItem,
    };
    s3.deleteObject(params, (error, data) => {
      if (error) {
        console.log(error, error.stack);
      }
      return data;
    });
  } catch (error) {
    // assert.isNotOk(error, "Promise error");
    // done();
  }
};
const convertToSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

export default {
  async create(req, res, next) {
    const { name, sequence } = req.body;
    const query = {};
    query.where = {};

    query.where.name = name;

    db.collection
      .findAll(query)
      .then((list) => {
        if (list && list.length) {
          throw new RequestError("Already exists this collection", 409);
        } else {
          return db.collection.create({
            name: name,
            sequence: sequence,
            slug: convertToSlug(name),
          });
        }
      })
      .then((success) => {
        let response = Util.getFormatedResponse(false, {
          message: "Successfully created",
        });
        res.status(response.code).json(response);
      })
      .catch(function (err) {
        let response = Util.getFormatedResponse(true, {
          message: err,
        });
        res.status(response.code).json(response);
      });
  },
  async getList(req, res, next) {
    const query = {};
    query.where = {};
    db.collection
      .findAll()
      .then((success) => {
        let response = Util.getFormatedResponse(false, success, {
          message: "Successfully",
        });
        res.status(response.code).json(response);
      })
      .catch(function (err) {
        let response = Util.getFormatedResponse(true, {
          message: err,
        });
        res.status(response.code).json(response);
      });
  },
  async update(req, res, next) {
    const { id, name, sequence } = req.body;
    const query = {};
    query.where = {};
    query.where.id = id;
    db.collection
      .findOne(query)
      .then((list) => {
        if (list) {
          return db.collection.update(
            {
              name: name,
              sequence: sequence,
              slug: convertToSlug(name),
            },
            { where: { id: id } }
          );
        } else {
          throw new RequestError("Not found collection", 409);
        }
      })
      .then((success) => {
        let response = Util.getFormatedResponse(false, {
          message: "Successfully updated",
        });
        res.status(response.code).json(response);
      })
      .catch(function (err) {
        let response = Util.getFormatedResponse(true, {
          message: err,
        });
        res.status(response.code).json(response);
      });
  },
  async itemCreate(req, res, next) {
    try {
      const { collectionId, name } = req.body;
      db.item
        .create({
          name: name,
          slug: convertToSlug(name),
          collectionId: collectionId,
          thumbnail: req.file ? req.file.location : null,
        })
        .then((category) => {
          var response = Util.getFormatedResponse(false, {
            message: "Successfully Updated category",
          });
          res.status(response.code).json(response);
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError(err);
    }
  },
  async getItem(req, res, next) {
    const { collectionId } = req.query;
    const query = {};
    query.where = {};
    query.where.collectionId = collectionId;
    db.item
      .findAll(query)
      .then((success) => {
        let response = Util.getFormatedResponse(false, success, {
          message: "Successfully",
        });
        res.status(response.code).json(response);
      })
      .catch(function (err) {
        let response = Util.getFormatedResponse(true, {
          message: err,
        });
        res.status(response.code).json(response);
      });
  },
  async deleteItem(req, res, next) {
    const { id, thumbnail } = req.body;
    deleteFileFromS3(thumbnail)
      .then((data) => {
        if (!data) {
          return db.item.destroy({ where: { id: id } });
        }
        throw new RequestError("error");
      })
      .then((success) => {
        let response = Util.getFormatedResponse(false, {
          message: "Successfully deleted item from collection",
        });
        res.status(response.code).json(response);
      });
  },
  async flashSaleCreate(req, res, next) {
    const { title, startDate, endDate } = req.body;
    const tagsArr = req.body.productIds.split(",");
    const productIdsOR = [];
    for (const tag of tagsArr) {
      productIdsOR.push(tag);
    }
    const query = {};
    query.where = {};
    query.where.title = title;
    try {
      db.ch_flash_sale
        .findAll(query)
        .then(async (list) => {
          if (list && list.length) {
            throw new RequestError("Already exists this collection", 409);
          } else {
            const t = await db.sequelize.transaction();
            try {
              const flashSale = await db.ch_flash_sale.create(
                {
                  title: title,
                  slug: convertToSlug(title),
                  status: 1,
                  startDate: startDate,
                  thumbnail: req.file ? req.file.location : "",
                  endDate: endDate,
                },
                { transaction: t }
              );
              let itemEntries = [];
              for (var i = 0; i < productIdsOR.length; i++) {
                itemEntries.push({
                  flashSaleId: flashSale.id,
                  productId: productIdsOR[i],
                  status: 1,
                });
              }
              if (itemEntries.length)
                await db.ch_flash_sale_item.bulkCreate(itemEntries, {
                  transaction: t,
                });

              return t.commit();
            } catch (err) {
              await t.rollback();
              throw err;
            }
          }
        })
        .then((success) => {
          let response = Util.getFormatedResponse(false, {
            message: "Successfully created",
          });
          res.status(response.code).json(response);
        })
        .catch(function (err) {
          let response = Util.getFormatedResponse(true, {
            message: err,
          });
          res.status(response.code).json(response);
        });
    } catch (err) {
      let response = Util.getFormatedResponse(true, {
        message: err,
      });
      res.status(response.code).json(response);
    }
  },
  async getFlashSaleList(req, res, next) {
    const query = {};
    query.where = {};
    query.include = [
      {
        model: db.ch_flash_sale_item,
        as: "flashSaleItem",
        attributes: ["id"],
        include: [
          {
            model: db.product,
            as: "productList",
            attributes: ["id", "name", "slug"],
          },
        ],
      },
    ];

    db.ch_flash_sale
      .findAll(query)
      .then((success) => {
        let itemEntries = [];
        if (success && success.length) {
          for (var i = 0; i < success.length; i++) {
            itemEntries.push({
              id: success[i].id,
              title: success[i].title,
              slug: success[i].slug,
              status: success[i].status,
              thumbnail: success[i].thumbnail,
              startDate: success[i].startDate,
              endDate: success[i].endDate,
              product: success[i].flashSaleItem,
            });
          }
        }
        let response = Util.getFormatedResponse(false, itemEntries, {
          message: "Successfully",
        });
        res.status(response.code).json(response);
      })
      .catch(function (err) {
        console.log(err);
        let response = Util.getFormatedResponse(true, {
          message: err,
        });
        res.status(response.code).json(response);
      });
  },
  async deleteProductFromFlash(req, res, next) {
    try {
      db.ch_flash_sale_item
        .findOne({ where: { id: req.query.id } })
        .then((list) => {
          if (list) {
            return db.ch_flash_sale_item.destroy({ where: { id: list.id } });
          }
          throw new RequestError("Product is not found");
        })
        .then((re) => {
          return res.status(200).json({
            message: "success",
            status: "deleted product Seccessfully",
          });
        })
        .catch((err) => {
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },
  async flashSaleUpdate(req, res, next) {
    deleteFileFromS3(thumbnail);
    const { id, status, thumbnail, title, startDate, endDate } = req.body;
    const tagsArr = req.body.productIds.split(",");
    const productIdsOR = [];
    for (const tag of tagsArr) {
      productIdsOR.push(tag);
    }
    const query = {};
    query.where = {};
    query.where.id = id;
    db.ch_flash_sale
      .findOne(query)
      .then(async (list) => {
        if (list) {
          const t = await db.sequelize.transaction();
          try {
            const flashSale = await db.ch_flash_sale.update(
              {
                title: title,
                slug: convertToSlug(title),
                status: status,
                thumbnail: req.file ? req.file.location : list.thumbnail,
                startDate: startDate,
                endDate: endDate,
              },
              { where: { id: id } },
              { transaction: t }
            );
            let itemEntries = [];
            for (var i = 0; i < productIdsOR.length; i++) {
              itemEntries.push({
                flashSaleId: id,
                productId: productIdsOR[i],
                status: 1,
              });
            }
            if (itemEntries.length)
              await db.ch_flash_sale_item.bulkCreate(
                itemEntries,
                {
                  updateOnDuplicate: ["productId"],
                },
                {
                  transaction: t,
                }
              );

            return t.commit();
          } catch (err) {
            await t.rollback();
            throw error;
          }
        } else {
          throw new RequestError("Not found collection", 409);
        }
      })
      .then((success) => {
        let response = Util.getFormatedResponse(false, {
          message: "Successfully updated",
        });
        res.status(response.code).json(response);
      })
      .catch(function (err) {
        let response = Util.getFormatedResponse(true, {
          message: err,
        });
        res.status(response.code).json(response);
      });
  },
  async flashSaleStatusUpdate(req, res, next) {
    const { id, status } = req.body;

    const query = {};
    query.where = {};
    query.where.id = id;
    db.ch_flash_sale
      .findOne(query)
      .then(async (list) => {
        if (list) {
          const t = await db.sequelize.transaction();
          try {
            const flashSale = await db.ch_flash_sale.update(
              {
                status: status,
              },
              { where: { id: id } },
              { transaction: t }
            );
            return t.commit();
          } catch (err) {
            await t.rollback();
            throw error;
          }
        } else {
          throw new RequestError("Not found collection", 409);
        }
      })
      .then((success) => {
        let response = Util.getFormatedResponse(false, {
          message: "Successfully updated",
        });
        res.status(response.code).json(response);
      })
      .catch(function (err) {
        let response = Util.getFormatedResponse(true, {
          message: err,
        });
        res.status(response.code).json(response);
      });
  },
};
