import { db } from "../../../models";
const { Op } = require("sequelize");
import { queue } from "../../../kue";
import config from "../../../config";
import AWS from "aws-sdk";
import moment from "moment";
var Util = require("../../../helpers/Util");

const s3 = new AWS.S3({
  accessKeyId: config.app.AWS_ACCESS_KEY,
  secretAccessKey: config.app.AWS_SECRET_KEY,
});

let deleteFileFromS3 = async (imgUrl) => {
  try {
    const lastItem = imgUrl.substring(imgUrl.lastIndexOf("/") + 1);
    let params = {
      Bucket: "grozep-photo",
      Key: lastItem,
    };
    s3.deleteObject(params, (error, data) => {
      if (error) {
        console.log(error, error.stack);
      }
      return data;
    });
  } catch (error) {
    assert.isNotOk(error, "Promise error");
    done();
  }
};

export default {
  /* Add user api start here................................*/

  async addProduct(req, res, next) {
    try {
      const {
        categoryId,
        subCategoryId,
        childCategoryId,
        name,
        slug,
        brand,
        status,
        productVariants,
        desc,
      } = req.body;
      let varients = JSON.parse(productVariants);
      db.product
        .findOne({
          where: { name: name },
        })
        .then(async (product) => {
          if (!product) {
            // let code = ;
            const t = await db.sequelize.transaction();
            try {
              const productCreated = await db.product.create(
                {
                  categoryId: categoryId,
                  subCategoryId: subCategoryId,
                  childCategoryId: childCategoryId,
                  name: name,
                  slug: slug,
                  status: "inactive",
                  brandId: brand,
                  desc: desc,
                  photo: req.file ? req.file.location : "",
                },
                { transaction: t }
              );

              let priceEntries = [];
              for (var i = 0; i < varients.length; i++) {
                priceEntries.push({
                  productId: productCreated.id,
                  productName: varients[i].productName,
                  productCode: varients[i].productCode
                    ? varients[i].productCode
                    : "PD" + Math.random().toString(36).substr(2, 4),
                  actualPrice: varients[i].actualPrice,
                  distributorPrice: varients[i].distributorPrice,
                  marginPer: varients[i].marginPer,
                  marginPrice: varients[i].marginPrice,
                  buyerPrice: varients[i].buyerPrice,
                  sellerPrice: varients[i].sellerPrice,

                  unitSize: varients[i].unitSize,
                  qty: varients[i].qty,
                  colorCode: varients[i].colorCode,

                  discountPer: varients[i].discountPer,
                  discount: varients[i].discount,
                  total: varients[i].total,
                  netPrice: varients[i].netPrice,
                });
              }
              if (priceEntries.length)
                await db.ProductVariant.bulkCreate(priceEntries, {
                  transaction: t,
                });

              return t.commit();
            } catch (error) {
              // If the execution reaches this line, an error was thrown.
              await t.rollback();
              throw error;
            }
          }
          throw new RequestError("Already exist product", 409);
        })

        .then((product) => {
          res
            .status(200)
            .json({ success: true, msg: "Successfully inserted product" });
        })
        .catch(function (err) {
          console.log(err);
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  async index(req, res, next) {
    try {
      const { supplierId, categoryId, subCategoryId } = req.query;
      db.product
        .findAll({
          order: [["createdAt", "DESC"]],
          where: {
            supplierId: supplierId,
            categoryId: categoryId,
            subCategoryId: subCategoryId,
          },
        })
        .then((product) => {
          res.status(200).json({ success: true, product });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  async getAllProductList(req, res, next) {
    let limit = 40;
    let offset = 0;
    let page = 1;
    if (req.body.limit != undefined) {
      limit = parseInt(req.body.limit);
    }
    if (req.body.page) {
      page = req.body.page;
      if (page < 1) page = 1;
    }
    let { status, id, categoryId } = req.body;
    try {
      if (id) {
        db.product
          .findAll({
            where: { id: req.body.id },
            include: [{ model: db.productphoto }, { model: db.ProductVariant }],
          })
          .then((list) => {
            res.status(200).json({ product: list });
          })
          .catch(function (err) {
            console.log("some error", err);
            next(err);
          });
      } else if (status && categoryId) {
        db.product
          .findAll({
            where: { status: status, categoryId: categoryId },
            include: [{ model: db.productphoto }, { model: db.ProductVariant }],

            // include: [{ model: db.SubCategory, attributes: ["id", "sub_name"], include: [{ model: db.category, attributes: ["id", "name"] }] }],
          })
          .then((list) => {
            res.status(200).json({ product: list });
          })
          .catch(function (err) {
            console.log("some error", err);
            next(err);
          });
      } else {
        db.product
          .count()
          .then((count) => {
            let pages = Math.ceil(count / limit);
            offset = limit * (page - 1);
            return db.product
              .findAll({
                order: [["createdAt", "DESC"]],
                include: [
                  { model: db.productphoto },
                  { model: db.ProductVariant },
                ],
                // include: [{ model: db.SubCategory, attributes: ["id", "sub_name"], include: [{ model: db.category, attributes: ["id", "name"] }] }],

                limit: limit,
                offset: offset,
              })
              .then((r) => [r, pages, count]);
          })
          .then(([list, pages, count]) => {
            res.status(200).json({ product: list, count: count, pages: pages });
          })
          .catch(function (err) {
            console.log("some error", err);
            next(err);
          });
      }
    } catch (err) {
      next(err);
    }
  },
  async getProductForFlash(req, res, next) {
    try {
      const query = {};
      query.where = {};
      query.where.SellerId = {
        [Op.ne]: null,
      };
      query.where.name = {
        [Op.ne]: null,
      };
      query.where.PubilshStatus = {
        [Op.eq]: "Published",
      };
      query.attributes = ["id", "name", "photo"];
      query.order = [["createdAt", "DESC"]];
      query.include = [
        {
          model: db.ProductVariant,
        },
      ];
      let product = await db.product.findAll({ ...query });
      if (product.length > 0) {
        const arrData = [];
        product.forEach((value) => {
          const dataList = {
            id: value.id,
            VarientId: value.ProductVariants[0]
              ? value.ProductVariants[0].id
              : null,
            name: value.name,
            slug: value.slug,
            Thumbnail: value.ProductVariants[0]
              ? value.ProductVariants[0].thumbnail
              : null,
            distributorPrice: value.ProductVariants[0]
              ? value.ProductVariants[0].distributorPrice
              : null,
            netPrice: value.ProductVariants[0]
              ? value.ProductVariants[0].netPrice
              : null,
            discount: value.ProductVariants[0]
              ? value.ProductVariants[0].discount
              : null,
            discountPer: value.ProductVariants[0]
              ? value.ProductVariants[0].discountPer
              : null,
          };
          arrData.push(dataList);
        });
        var response = Util.getFormatedResponse(false, arrData, {
          message: "Success",
        });
        res.status(response.code).json(response);
      } else {
        var response = Util.getFormatedResponse(false, {
          message: "No data found",
        });
        res.status(response.code).json(response);
      }
    } catch (err) {
      next(err);
    }
  },
  async update(req, res, next) {
    try {
      const {
        productId,
        categoryId,
        subCategoryId,
        childCategoryId,
        name,
        slug,
        brand,
        status,
        desc,
        productVariants,
      } = req.body;
      let varients = JSON.parse(productVariants);
      db.product
        .findOne({ where: { id: productId } })
        .then(async (product) => {
          if (product) {
            return db.product.update(
              {
                categoryId: categoryId ? categoryId : product.categoryId,
                subCategoryId: subCategoryId
                  ? subCategoryId
                  : product.subCategoryId,
                childCategoryId: childCategoryId
                  ? childCategoryId
                  : product.childCategoryId,
                name: name,
                slug: slug,
                status: parseInt(status) ? "active" : "inactive",
                brandId: brand ? brand : product.brandId,
                desc: desc,
                photo: req.file ? req.file.location : product.photo,
              },
              { where: { id: product.id } }
            );
          }
        })
        .then((list) => {
          if (varients.length) {
            let code = "PD" + Math.random().toString(36).substr(2, 4);
            let priceEntries = [];
            for (var i = 0; i < varients.length; i++) {
              priceEntries.push({
                productId: productId,
                id: varients[i].id,
                productName: varients[i].productName,
                productCode: varients[i].productCode
                  ? varients[i].productCode
                  : code,
                actualPrice: varients[i].actualPrice,
                distributorPrice: varients[i].distributorPrice,
                marginPer: varients[i].marginPer,
                marginPrice: varients[i].marginPrice,
                buyerPrice: varients[i].buyerPrice,
                sellerPrice: varients[i].sellerPrice,

                unitSize: varients[i].unitSize,
                qty: varients[i].qty,
                colorCode: varients[i].colorCode,

                discountPer: varients[i].discountPer,
                discount: varients[i].discount,
                total: varients[i].total,
                netPrice: varients[i].netPrice,
              });
            }
            return db.ProductVariant.bulkCreate(priceEntries, {
              updateOnDuplicate: Object.keys(priceEntries[0]),
            });
          }
        })
        .then((p) => {
          res.status(200).json({ success: true, msg: "Updated Successfully" });
        })
        .catch(function (err) {
          res.status(500).send({ success: false, msg: err });
          next(err);
        });
    } catch (err) {
      res.status(500).send({ success: false, msg: err });
    }
  },
  async searchAllProductList(req, res, next) {
    try {
      db.product
        .findAll({
          order: [["createdAt", "DESC"]],
        })
        .then((product) => {
          res.status(200).json({ success: true, data: product });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },
  async getProductListByCategory(req, res, next) {
    try {
      db.product
        .findAll({
          order: [["createdAt", "DESC"]],
          where: {
            categoryId: req.query.categoryId,
            subCategoryId: req.query.subCategoryId,
          },
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
  async getProductListById(req, res, next) {
    try {
      db.product
        .findAll({
          where: { id: req.query.id },
          include: [{ model: db.productphoto, attributes: ["id", "imgUrl"] }],
          order: [["createdAt", "DESC"]],
        })
        .then((list) => {
          res.status(200).json({ success: true, product: list });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  async getWebProductListById(req, res, next) {
    let { varientId, productId } = req.body;
    try {
      if (varientId && productId) {
        db.product
          .findOne({
            where: { id: productId },
            include: [
              // { model: db.productphoto, where: { varientId: varientId ? varientId: '', productId: productId ? productId: ''} },
              {
                model: db.ProductVariant,
                where: { id: varientId, productId: productId },
              },
              { model: db.Seo_Details },
              { model: db.ch_brand_detail, attributes: ["id", "name"] },
            ],
            order: [["createdAt", "DESC"]],
          })
          .then((list) => {
            return db.productphoto
              .findAll({
                where: { varientId: varientId, productId: productId },
              })
              .then((r) => [r, list]);
          })
          .then(([imglist, list]) => {
            // console.log(JSON.stringify(imglist))
            res
              .status(200)
              .json({ success: true, data: list, imglist: imglist });
          })
          .catch(function (err) {
            next(err);
          });
      } else {
        db.product
          .findOne({
            where: { id: req.body.id },
            include: [
              {
                model: db.productphoto,
                attributes: ["id", "imgUrl", "productid", "varientId"],
              },
              { model: db.ProductVariant },
              { model: db.Seo_Details },
              { model: db.ch_brand_detail, attributes: ["id", "name"] },
            ],
            order: [["createdAt", "DESC"]],
          })
          .then((list) => {
            res.status(200).json({ success: true, data: list });
          })
          .catch(function (err) {
            console.log(err);
            next(err);
          });
      }
    } catch (err) {
      console.log(err);
      throw new RequestError("Error");
    }
  },
  async addProductOffer(req, res, next) {
    try {
      const { productId, qty, discount_per, discount_price, total, net_price } =
        req.body;
      db.ProductOffer.findOne({ where: { id: productId } })
        .then((list) => {
          if (!list) {
            return db.ProductOffer.create({
              productId: productId,
              image: req.file ? req.file.location : "",
              qty: qty,
              discount_per: discount_per,
              discount_price: discount_price,
              total: total,
              net_price: net_price,
            });
          } else {
            return db.ProductOffer.update(
              {
                qty: qty,
                discount_per: discount_per,
                discount_price: discount_price,
                total: total,
                net_price: net_price,
              },
              { where: { id: list.id } }
            );
          }
        })
        .then((p) => {
          res.status(200).json({ success: true, msg: "Successfully" });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  async getProductOffer(req, res, next) {
    try {
      db.ProductOffer.findAll({
        include: [
          {
            model: db.product,
            attributes: [
              "id",
              "categoryId",
              "price",
              "item_name",
              "description",
              "brand",
            ],
            include: [{ model: db.category, attributes: ["id", "name"] }],
          },
        ],
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

  async productDelete(req, res, next) {
    db.product
      .findOne({ where: { id: parseInt(req.query.id) } })
      .then(async (product) => {
        const t = await db.sequelize.transaction();
        if (product) {
          try {
            await db.ProductVariant.destroy(
              { where: { productId: product.id } },
              { transaction: t }
            );
            await db.product.destroy(
              { where: { id: product.id } },
              { transaction: t }
            );

            return t.commit();
          } catch (err) {
            await t.rollback();
            throw error;
          }
        }
        throw new RequestError("Product is not found");
      })
      .then((re) => {
        return res.status(200).json({ status: "deleted Product Seccessfully" });
      })
      .catch((err) => {
        next(err);
      });
  },

  async productVarients(req, res, next) {
    db.ProductVariant.findOne({ where: { id: parseInt(req.query.id) } })
      .then(async (product) => {
        const t = await db.sequelize.transaction();
        if (product) {
          try {
            await db.ProductVariant.destroy(
              { where: { id: product.id } },
              { transaction: t }
            );
            return t.commit();
          } catch (err) {
            await t.rollback();
            throw error;
          }
        }
        throw new RequestError("Productprice is not found");
      })
      .then((re) => {
        return res
          .status(200)
          .json({ status: "Deleted Productprice Seccessfully" });
      })
      .catch((err) => {
        next(err);
      });
  },
  async deleteMainProduct(req, res, next) {
    db.product
      .findOne({ where: { id: parseInt(req.query.id) } })
      .then(async (product) => {
        const t = await db.sequelize.transaction();
        if (product) {
          try {
            await db.product.destroy(
              { where: { id: product.id } },
              { transaction: t }
            );
            return t.commit();
          } catch (err) {
            await t.rollback();
            throw error;
          }
        }
        throw new RequestError("Productprice is not found");
      })
      .then((re) => {
        return res
          .status(200)
          .json({ status: "Deleted Productprice Seccessfully" });
      })
      .catch((err) => {
        next(err);
      });
  },
  async newArrivalProduct(req, res, next) {
    try {
      db.product
        .findAll({
          order: [["createdAt", "DESC"]],
          where: {
            [Op.and]: [
              {
                createdAt: {
                  [Op.gte]: moment().subtract(7, "days").toDate(),
                },
              },
              { status: "active" },
            ],
          },
          include: [
            { model: db.ch_brand_detail, attributes: ["id", "name"] },
            { model: db.productphoto, attributes: ["id", "imgUrl"] },
            { model: db.ProductVariant },
          ],
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
  async productOfferDelete(req, res, next) {
    db.ProductOffer.findOne({ where: { id: parseInt(req.params.id) } })
      .then((product) => {
        if (product) {
          return db.ProductOffer.destroy({ where: { id: product.id } });
        }
        throw new RequestError("Product is not found");
      })
      .then((re) => {
        return res.status(200).json({ status: "deleted Product Seccessfully" });
      })
      .catch((err) => {
        next(err);
      });
  },

  async multiplePhotoUpload(req, res, next) {
    let attachmentEntries = [];
    var productId = req.body.productId;
    for (var i = 0; i < req.files.length; i++) {
      attachmentEntries.push({
        productId: productId,
        name: req.files[i].filename,
        mime: req.files[i].mimetype,
        imgUrl: req.files[i].location,
      });
    }

    db.product
      .findOne({
        where: { id: productId },
      })
      .then((r) => {
        if (r) {
          return queue
            .create("img-upload", {
              productId: productId,
              productName: r.item_name,
              attachmentEntries: attachmentEntries,
            })
            .save();
        }
        throw new RequestError("ProductId is not found");
      })
      .then((r) => {
        res.status(200).json({ success: r });
      })
      .catch(function (error) {
        console.log(error);
        res.status(500).json({ errors: ["Error insert photo"] });
      });
  },

  async varientImageUpload(req, res, next) {
    let attachmentEntries = [];
    let { productId, varientId } = req.body;
    for (var i = 0; i < req.files.length; i++) {
      attachmentEntries.push({
        productId: productId,
        varientId: varientId,
        name: req.files[i].filename,
        mime: req.files[i].mimetype,
        imgUrl: req.files[i].location,
      });
    }
    db.ProductVariant.findOne({
      where: { id: varientId, productId: productId },
    })
      .then((r) => {
        if (r) {
          return queue
            .create("img-upload", {
              productId: req.body.productId,
              varientId: req.body.varientId,
              productName: r.item_name,
              attachmentEntries: attachmentEntries,
            })
            .save();
        }
        throw new RequestError("ProductId is not found");
      })
      .then((r) => {
        res.status(200).json({ success: r });
      })
      .catch(function (error) {
        console.log(error);
        res.status(500).json({ errors: ["Error insert photo"] });
      });
  },

  async getAllPhoto(req, res, next) {
    let limit = 50;
    let offset = 0;
    let page = 1;
    if (req.body.limit != undefined) {
      limit = parseInt(req.body.limit);
    }
    if (req.body.page) {
      page = req.body.page;
      if (page < 1) page = 1;
    }
    try {
      db.product
        .count({
          include: [{ model: db.productphoto }],
        })
        .then((count) => {
          let pages = Math.ceil(count / limit);
          offset = limit * (page - 1);
          return db.product
            .findAll({
              order: [["createdAt", "DESC"]],
              attributes: ["id", "name"],
              limit: limit,
              offset: offset,
              include: [
                {
                  model: db.productphoto,
                  attributes: ["id", "imgUrl"],
                  limit: limit,
                },
              ],
            })
            .then((r) => [r, pages, count]);
        })
        .then(([list, pages, count]) => {
          res.status(200).json({ data: list, count: count, pages: pages });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  async getAllPhotoById(req, res, next) {
    const { id } = req.body;
    let whereCond = {};
    if (id) {
      whereCond = { id: id };
    }
    try {
      db.product
        .findAll({
          where: whereCond,
          order: [["createdAt", "DESC"]],
          attributes: ["id", "name"],
          include: [{ model: db.productphoto, attributes: ["id", "imgUrl"] }],
        })
        .then((data) => {
          res.status(200).json({ success: true, data });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  async deleteSliderPhoto(req, res, next) {
    db.productphoto
      .findOne({ where: { id: parseInt(req.query.id) } })
      .then((product) => {
        if (product) {
          return db.productphoto.destroy({ where: { id: req.query.id } });
        }
        throw new RequestError("Product is not found");
      })
      .then((re) => {
        return res.status(200).json({ status: "deleted Product Seccessfully" });
      })
      .catch((err) => {
        next(err);
      });
  },
  //All GroceryStample product
  async getAllGrocerryStaples(req, res, next) {
    let limit = 50;
    let offset = 0;
    let page = 1;
    if (req.body.limit != undefined) {
      limit = parseInt(req.body.limit);
    }
    if (req.body.page) {
      page = req.body.page;
      if (page < 1) page = 1;
    }
    try {
      db.category
        .count({
          attributes: ["id", "slug"],
          where: { slug: "grocery-staples" },
          include: [
            {
              model: db.product,
              order: [["createdAt", "DESC"]],
              where: { status: "active" },
              include: [
                { model: db.productphoto, attributes: ["id", "imgUrl"] },
              ],
            },
          ],
        })
        .then((count) => {
          let pages = Math.ceil(count / limit);
          offset = limit * (page - 1);
          return db.category
            .findOne({
              attributes: ["id", "slug"],
              where: { slug: "grocery-staples" },
              include: [
                {
                  model: db.product,
                  order: [["createdAt", "DESC"]],
                  limit: limit,
                  offset: offset,
                  where: { status: "active" },
                  include: [
                    {
                      model: db.productphoto,
                      attributes: ["id", "imgUrl"],
                      limit: limit,
                      offset: offset,
                    },
                    { model: db.ProductVariant },
                  ],
                },
              ],
            })
            .then((r) => [r, pages, count]);
        })
        .then(([list, pages, count]) => {
          res.status(200).json({ data: list, count: count, pages: pages });
        })
        .catch(function (err) {
          console.log("some error", err);
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  //All PersonalCare product
  async getAllPersonalCare(req, res, next) {
    let limit = 50;
    let offset = 0;
    let page = 1;
    if (req.body.limit != undefined) {
      limit = parseInt(req.body.limit);
    }
    if (req.body.page) {
      page = req.body.page;
      if (page < 1) page = 1;
    }
    try {
      db.category
        .count({
          attributes: ["id", "slug"],
          where: { slug: "personal-care" },
          include: [
            {
              model: db.product,
              order: [["createdAt", "DESC"]],
              where: { status: "active" },
              include: [
                { model: db.productphoto, attributes: ["id", "imgUrl"] },
                { model: db.ProductVariant },
              ],
            },
          ],
        })
        .then((count) => {
          let pages = Math.ceil(count / limit);
          offset = limit * (page - 1);
          return db.category
            .findOne({
              attributes: ["id", "slug"],
              where: { slug: "personal-care" },
              include: [
                {
                  model: db.product,
                  order: [["createdAt", "DESC"]],
                  limit: limit,
                  offset: offset,
                  where: { status: "active" },
                  include: [
                    {
                      model: db.productphoto,
                      attributes: ["id", "imgUrl"],
                      limit: limit,
                      offset: offset,
                    },
                    { model: db.ProductVariant },
                  ],
                },
              ],
            })
            .then((r) => [r, pages, count]);
        })
        .then(([list, pages, count]) => {
          res.status(200).json({ data: list, count: count, pages: pages });
        })
        .catch(function (err) {
          console.log("some error", err);
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  //All beverages
  async getAllHomeKitchen(req, res, next) {
    let limit = 50;
    let offset = 0;
    let page = 1;
    if (req.body.limit != undefined) {
      limit = parseInt(req.body.limit);
    }
    if (req.body.page) {
      page = req.body.page;
      if (page < 1) page = 1;
    }
    try {
      db.category
        .count({
          attributes: ["id", "slug"],
          where: { slug: "beverages" },
          include: [
            {
              model: db.product,
              order: [["createdAt", "DESC"]],
              where: { status: "active" },
              include: [
                { model: db.productphoto, attributes: ["id", "imgUrl"] },
                { model: db.ProductVariant },
              ],
            },
          ],
        })
        .then((count) => {
          let pages = Math.ceil(count / limit);
          offset = limit * (page - 1);
          return db.category
            .findOne({
              attributes: ["id", "slug"],
              where: { slug: "home-kitchen" },
              include: [
                {
                  model: db.product,
                  order: [["createdAt", "DESC"]],
                  limit: limit,
                  offset: offset,
                  where: { status: "active" },
                  include: [
                    {
                      model: db.productphoto,
                      attributes: ["id", "imgUrl"],
                      limit: limit,
                      offset: offset,
                    },
                    { model: db.ProductVariant },
                  ],
                },
              ],
            })
            .then((r) => [r, pages, count]);
        })
        .then(([list, pages, count]) => {
          res.status(200).json({ data: list, count: count, pages: pages });
        })
        .catch(function (err) {
          console.log("some error", err);
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  async getAllProductBySlug(req, res, next) {
    let limit = 50;
    let offset = 0;
    let page = 1;
    if (req.body.limit != undefined) {
      limit = parseInt(req.body.limit);
    }
    if (req.body.page) {
      page = req.body.page;
      if (page < 1) page = 1;
    }
    let { slug } = req.body;
    let wherecond = {};
    if (slug) {
      wherecond.slug = slug;
    }
    try {
      let result = {};
      result.category = await db.category.findOne({
        where: wherecond,
      });
      result.subcat = await db.SubCategory.findOne({
        where: wherecond,
      });
      result.brand = await db.ch_brand_detail.findOne({
        where: wherecond,
      });
      if (result.category || result.subcat) {
        db.product
          .count({
            order: [["createdAt", "DESC"]],
            where: {
              [Op.or]: [
                {
                  categoryId: result.category ? result.category.id : null,
                  status: "active",
                },
                {
                  subCategoryId: result.subcat ? result.subcat.id : null,
                  status: "active",
                },
              ],
            },
            include: [
              { model: db.productphoto, attributes: ["id", "imgUrl"] },
              { model: db.ProductVariant },
            ],
            limit: limit,
            offset: offset,
          })
          .then((count) => {
            let pages = Math.ceil(count / limit);
            offset = limit * (page - 1);
            return db.product
              .findAll({
                order: [["createdAt", "DESC"]],
                where: {
                  [Op.or]: [
                    {
                      categoryId: result.category ? result.category.id : null,
                      status: "active",
                    },
                    {
                      subCategoryId: result.subcat ? result.subcat.id : null,
                      status: "active",
                    },
                  ],
                },
                include: [
                  { model: db.productphoto, attributes: ["id", "imgUrl"] },
                  { model: db.ProductVariant },
                ],
                limit: limit,
                offset: offset,
              })
              .then((r) => [r, pages, count]);
          })
          .then(([list, pages, count]) => {
            res.status(200).json({ data: list, count: count, pages: pages });
          })
          .catch(function (err) {
            console.log("some error", err);
            next(err);
          });
      }
      if (result.brand) {
        db.product
          .count({
            order: [["createdAt", "DESC"]],
            where: {
              brandId: result.brand.id,
            },
            include: [
              { model: db.productphoto, attributes: ["id", "imgUrl"] },
              { model: db.ProductVariant },
            ],
            limit: limit,
            offset: offset,
          })
          .then((count) => {
            let pages = Math.ceil(count / limit);
            offset = limit * (page - 1);
            return db.product
              .findAll({
                order: [["createdAt", "DESC"]],
                where: {
                  brandId: result.brand.id,
                },
                include: [
                  { model: db.productphoto, attributes: ["id", "imgUrl"] },
                  { model: db.ProductVariant },
                ],
                limit: limit,
                offset: offset,
              })
              .then((r) => [r, pages, count]);
          })
          .then(([list, pages, count]) => {
            res.status(200).json({ data: list, count: count, pages: pages });
          })
          .catch(function (err) {
            next(err);
          });
      }
    } catch (err) {
      throw new RequestError(err);
    }
  },

  // filter product

  async getFilterbyProduct(req, res, next) {
    try {
      let search = "%%";
      if (req.query.search) {
        search = "%" + req.query.search + "%";
      }
      let result = {};
      result.maincat = await db.category.findOne({
        where: { name: { [Op.like]: search } },
      });
      result.subchild = await db.SubChildCategory.findOne({
        where: { name: { [Op.like]: search } },
      });

      result.subcat = await db.SubCategory.findOne({
        where: { sub_name: { [Op.like]: search } },
      });

      result.brand = await db.ch_brand_detail.findOne({
        where: { name: { [Op.like]: search } },
      });

      result.item = await db.product.findOne({
        where: { name: { [Op.like]: search } },
      });

      if (result.maincat) {
        db.product
          .findAll({
            order: [["createdAt", "DESC"]],
            where: {
              status: { [Op.eq]: "active" },
              categoryId: result.maincat.id,
            },
            include: [{ model: db.ProductVariant }, { model: db.productphoto }],
          })
          .then((product) => {
            return db.category
              .findOne({
                // attributes: ['id', 'name'],
                where: { id: result.maincat.id },
                include: [
                  {
                    model: db.SubCategory,
                    attributes: ["id", "sub_name"],
                    include: [
                      {
                        model: db.SubChildCategory,
                        attributes: ["id", "name", "subcategoryId"],
                      },
                    ],
                  },
                ],
              })
              .then((category) => [product, category]);
          })
          .then(([product, category]) => {
            res
              .status(200)
              .json({ success: true, data: product, category: category });
          })
          .catch(function (err) {
            next(err);
          });
      } else if (result.subcat) {
        db.product
          .findAll({
            order: [["createdAt", "DESC"]],
            where: {
              status: { [Op.eq]: "active" },
              subcategoryId: result.subcat.id,
            },
            include: [{ model: db.ProductVariant }, { model: db.productphoto }],
          })
          .then((product) => {
            return db.category
              .findOne({
                // attributes: ['id', 'name'],
                include: [
                  {
                    model: db.SubCategory,
                    where: {
                      // status: { [Op.eq]: 'active' },
                      id: result.subcat.id,
                    },
                    attributes: ["id", "sub_name"],
                    include: [
                      {
                        model: db.SubChildCategory,
                        attributes: ["id", "name", "subcategoryId"],
                      },
                    ],
                  },
                ],
              })
              .then((category) => [product, category]);
          })
          .then(([product, category]) => {
            res
              .status(200)
              .json({ success: true, data: product, category: category });
          })
          .catch(function (err) {
            console.log(err);
            next(err);
          });
      } else if (result.brand) {
        db.product
          .findAll({
            order: [["createdAt", "DESC"]],
            where: {
              status: { [Op.eq]: "active" },
              brandId: result.brand.id,
            },
            include: [{ model: db.ProductVariant }, { model: db.productphoto }],
          })
          .then((product) => {
            return db.category
              .findOne({
                // attributes: ['id', 'name'],
                include: [
                  {
                    model: db.SubCategory,
                    attributes: ["id", "sub_name"],
                    include: [
                      {
                        model: db.SubChildCategory,
                        attributes: ["id", "name", "subcategoryId"],
                      },
                    ],
                  },
                ],
              })
              .then((category) => [product, category]);
          })
          .then(([product, category]) => {
            res.status(200).json({
              success: true,
              data: product,
              category: category,
              brand: result.brand,
            });
          })
          .catch(function (err) {
            console.log(err);
            next(err);
          });
      } else if (result.subchild) {
        db.product
          .findAll({
            where: {
              status: { [Op.eq]: "active" },
              childCategoryId: result.subchild.id,
            },
            include: [{ model: db.ProductVariant }, { model: db.productphoto }],
          })
          .then((product) => {
            return db.category
              .findOne({
                // attributes: ['id', 'name'],
                include: [
                  {
                    model: db.SubCategory,
                    attributes: ["id", "sub_name"],
                    include: [
                      {
                        model: db.SubChildCategory,
                        where: {
                          // status: { [Op.eq]: 'active' },
                          id: result.subchild.id,
                        },
                        attributes: ["id", "name", "subcategoryId"],
                      },
                    ],
                  },
                ],
              })
              .then((category) => [product, category]);
          })
          .then(([product, category]) => {
            res
              .status(200)
              .json({ success: true, data: product, category: category });
          })
          .catch(function (err) {
            console.log(err);
            next(err);
          });
      } else {
        db.product
          .findAll({
            order: [["createdAt", "DESC"]],
            where: {
              status: { [Op.eq]: "active" },
              id: result.item.id,
            },
            include: [{ model: db.ProductVariant }, { model: db.productphoto }],
          })
          .then((product) => {
            return db.category
              .findOne({
                // attributes: ['id', 'name'],
                include: [
                  {
                    model: db.SubCategory,
                    attributes: ["id", "sub_name"],
                    include: [
                      {
                        model: db.SubChildCategory,
                        attributes: ["id", "name", "subcategoryId"],
                      },
                    ],
                  },
                ],
              })
              .then((category) => [product, category]);
          })
          .then(([product, category]) => {
            res
              .status(200)
              .json({ success: true, data: product, category: category });
          })
          .catch(function (err) {
            console.log(err);
            next(err);
          });
      }
    } catch (err) {
      console.log(err);
      throw new RequestError("Error");
    }
  },

  async GetAllByCategory(req, res, next) {
    try {
      db.SubCategory.findOne({
        // attributes: ["id", "sub_name", "slug"],
        where: { slug: req.body.slug },
        include: [
          {
            model: db.product,
            order: [["createdAt", "DESC"]],
            where: { status: "active" },
            include: [
              { model: db.productphoto, attributes: ["id", "imgUrl"] },
              { model: db.ProductVariant },
            ],
          },
        ],
      })
        .then((product) => {
          return db.SubCategory.findOne({
            // attributes: ["id", "sub_name", "slug"],
            where: { slug: req.body.slug },
            include: [
              {
                model: db.SubChildCategory,
                attributes: ["id", "name", "subCategoryId"],
              },
            ],
          }).then((r) => [product, r]);
        })
        .then(([product, r]) => {
          res.status(200).json({ success: true, data: product, category: r });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  // aws image delete
  async awsProductPhotoDelete(req, res, next) {
    try {
      const { id, imgUrl } = req.body;
      deleteFileFromS3(imgUrl)
        .then((data) => {
          if (!data) {
            return db.productphoto.destroy({ where: { id: id } });
          }
          throw new RequestError("error");
        })
        .then((success) => {
          res.status(200).json({
            success: true,
            message: "Successflly deleted image from s3 Bucket",
          });
        });
    } catch (err) {
      next(err);
    }
  },
  async relatedProduct(req, res, next) {
    let limit = 100;
    let offset = 0;
    let page = 1;
    if (req.body.limit != undefined) {
      limit = parseInt(req.body.limit);
    }
    if (req.body.page) {
      page = req.body.page;
      if (page < 1) page = 1;
    }
    try {
      db.product
        .findOne({
          where: { id: req.body.id },
        })
        .then((list) => {
          if (list) {
            return db.product
              .count({
                where: {
                  childCategoryId: list.childCategoryId,
                  status: "active",
                },
              })
              .then((count) => [count, list]);
          }
        })
        .then(([count, list]) => {
          let pages = Math.ceil(count / limit);
          offset = limit * (page - 1);
          return db.product
            .findAll({
              where: {
                childCategoryId: list.childCategoryId,
                status: "active",
              },
              include: [
                { model: db.ProductVariant },
                { model: db.productphoto },
              ],
              order: [
                ["id", "DESC"],
                ["name", "ASC"],
              ],
              limit: limit,
              offset: offset,
            })
            .then((r) => [r, pages, count]);
        })
        .then(([list, pages, count]) => {
          res.status(200).json({ data: list, count: count, pages: pages });
        })
        .catch(function (err) {
          console.log("some error", err);
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  async statusUpdate(req, res, next) {
    try {
      const { productId, PubilshStatus } = req.body;
      db.product
        .findOne({ where: { id: productId } })
        .then((product) => {
          if (product.id) {
            return db.product.update(
              {
                PubilshStatus: PubilshStatus,
              },
              { where: { id: productId } }
            );
          } else {
            throw new RequestError("Not found product", 409);
          }
        })
        .then((p) => {
          res
            .status(200)
            .json({ success: true, message: "Status Updated Successfully" });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError(err);
    }
  },

  async stockUpdate(req, res, next) {
    try {
      const { id, Available } = req.body;
      db.ProductVariant.findOne({ where: { id: id } })
        .then(async (product) => {
          if (product) {
            return db.ProductVariant.update(
              {
                Available: Available,
              },
              { where: { id: id } }
            );
          }
        })
        .then((p) => {
          res
            .status(200)
            .json({ success: true, msg: "Status Updated Successfully" });
        })
        .catch(function (err) {
          console.log(err);
          next(err);
        });
    } catch (err) {
      throw new RequestError(err);
    }
  },

  async bannerUpload(req, res, next) {
    try {
      const { id, slug, status, type } = req.body;
      db.BannerDetail.findOne({ where: { id: id || null } })
        .then(async (data) => {
          if (data) {
            return db.BannerDetail.update(
              {
                id: id,
                slug: slug ? slug : data.slug,
                status: status ? status : data.status,
                banner: req.file ? req.file.location : data.banner,
                type: type,
              },
              { where: { id: id } }
            );
          } else {
            return db.BannerDetail.create({
              slug: slug,
              status: 0,
              type: type,
              banner: req.file ? req.file.location : product.photo,
            });
          }
        })
        .then((p) => {
          res
            .status(200)
            .json({ success: true, message: "Banner Uploaded Successfully" });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError(error);
    }
  },

  async bannerList(req, res, next) {
    try {
      db.BannerDetail.findAll({
        where: { status: 1 },
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

  async bannerAdminList(req, res, next) {
    try {
      db.BannerDetail.findAll()
        .then((list) => {
          res.status(200).json({ success: true, data: list });
        })
        .catch(function (err) {
          console.log("==>", err);
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  async bannerStatus(req, res, next) {
    try {
      const { id, status } = req.body;

      db.BannerDetail.findOne({ where: { id: id } })
        .then(async (data) => {
          if (data) {
            return db.BannerDetail.update(
              {
                status: status,
              },
              { where: { id: id } }
            );
          }
        })
        .then((p) => {
          res
            .status(200)
            .json({ success: true, msg: "Banner Uploaded Successfully" });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  async bannerListDelete(req, res, next) {
    try {
      const { id, banner } = req.body;
      deleteFileFromS3(banner)
        .then((data) => {
          if (!data) {
            return db.BannerDetail.destroy({ where: { id: id } });
          }
          throw new RequestError("error");
        })
        .then((success) => {
          res.status(200).json({
            success: true,
            msg: "Successflly deleted image from s3 Bucket",
          });
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  async seoDetailsList(req, res, next) {
    const { productId, title, keyword, description } = req.body;
    try {
      db.Seo_Details.findOne({ where: { meta_title: title } })
        .then((list) => {
          if (!list) {
            return db.Seo_Details.create({
              productId: productId,
              meta_title: title,
              meta_desc: description,
              meta_keyword: keyword,
            });
          } else {
            return db.Seo_Details.update(
              {
                productId: productId,
                meta_title: title,
                meta_desc: description,
                meta_keyword: keyword,
              },
              { where: { id: id } }
            );
          }
        })
        .then((success) => {
          res.status(200).json({
            success: true,
            msg: "Successflly deleted image from s3 Bucket",
          });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      console.log("==>", err);
      throw new RequestError("Error");
    }
  },

  // brand details
  async createBrandDetails(req, res, next) {
    const { id, name, slug, title, keyword, desc } = req.body;
    try {
      db.ch_brand_detail
        .findOne({ where: { name: name } })
        .then((list) => {
          let code = "BR" + Math.random().toString(36).substr(2, 4);
          if (!list) {
            return db.ch_brand_detail.create({
              name: name,
              status: 1,
              slug: slug,
              code: code,
              title: title,
              keyword: keyword,
              desc: desc,
            });
          } else {
            return db.ch_brand_detail.update(
              {
                name: name ? name : list.name,
                status: 1,
                slug: slug ? slug : list.slug,
                code: code ? code : list.code,
                title: title ? title : list.title,
                keyword: keyword ? keyword : list.keyword,
                desc: desc ? desc : list.desc,
              },
              { where: { id: id } }
            );
          }
        })
        .then((success) => {
          res
            .status(200)
            .json({ success: true, msg: "Successflly added in list" });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError(err);
    }
  },

  async updateBrandDetails(req, res, next) {
    const { id, name, slug, title, keyword, desc } = req.body;
    try {
      db.ch_brand_detail
        .findOne({ where: { id: id } })
        .then((list) => {
          return db.ch_brand_detail.update(
            {
              name: name ? name : list.name,
              status: 1,
              slug: slug ? slug : list.slug,
              code: list.code,
              title: title ? title : list.title,
              keyword: keyword ? keyword : list.keyword,
              desc: desc ? desc : list.desc,
              thumbnail: req.file ? req.file.location : data.thumbnail,
            },
            { where: { id: id } }
          );
        })
        .then((success) => {
          var response = Util.getFormatedResponse(false, {
            message: "Success updated",
          });
          res.status(response.code).json(response);
        })
        .catch(function (err) {
          var response = Util.getFormatedResponse(true, {
            message: err,
          });
          res.status(response.code).json(response);
        });
    } catch (err) {
      var response = Util.getFormatedResponse(true, {
        message: err,
      });
      res.status(response.code).json(response);
    }
  },

  async getAllBrandList(req, res, next) {
    const { search_text } = req.body;
    let limit = 20;
    let offset = 0;
    let page = 1;
    if (req.body.limit != undefined) {
      limit = parseInt(req.body.limit);
    }
    if (req.body.page) {
      page = req.body.page;
      if (page < 1) page = 1;
    }
    try {
      let whereCond = {};
      if (search_text) {
        whereCond = {
          [Op.or]: [
            {
              name: {
                [Op.like]: "%" + search_text + "%",
              },
            },
            {
              slug: {
                [Op.like]: "%" + search_text + "%",
              },
            },
          ],
        };
      }
      db.ch_brand_detail
        .count({ where: whereCond, order: [["createdAt", "DESC"]] })
        .then((count) => {
          let pages = Math.ceil(count / limit);
          offset = limit * (page - 1);
          return db.ch_brand_detail
            .findAll({
              where: whereCond,
              order: [["createdAt", "DESC"]],
              order: [
                ["id", "DESC"],
                ["name", "ASC"],
              ],
              limit: limit,
              offset: offset,
            })
            .then((r) => [r, pages, count]);
        })
        .then(([list, pages, count]) => {
          res.status(200).json({
            status: 200,
            data: list,
            count: count,
            pages: pages,
            page: req.body.page,
          });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError(err);
    }
  },

  async brandListDelete(req, res, next) {
    try {
      const { id } = req.body;
      db.ch_brand_detail
        .findOne({ where: { id: id } })
        .then((data) => {
          if (data) {
            return db.ch_brand_detail.destroy({ where: { id: id } });
          }
          throw new RequestError("error");
        })
        .then((success) => {
          res.status(200).json({ success: true, msg: "Successflly deleted" });
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  async filtershortby(req, res, next) {
    let limit = 50;
    let offset = 0;
    let page = 1;
    let sortbason;
    if (req.body.limit != undefined) {
      limit = parseInt(req.body.limit);
    }
    if (req.body.page) {
      page = req.body.page;
      if (page < 1) page = 1;
    }
    let data = req.body;

    sortbason = data.sortbasedon;
    let cond;
    if (sortbason === "1") {
      cond = ["netPrice", "ASC"];
    } else if (sortbason === "2") {
      cond = ["netPrice", "DESC"];
    } else if (sortbason === "3") {
      cond = ["productName", "DESC"];
    } else if (sortbason === "4") {
      cond = ["createdAt", "DESC"];
    }
    // console.log(cond)
    try {
      db.category
        .findOne({
          where: { slug: req.body.slug },
        })
        .then((cat) => {
          db.product
            .count({
              // subQuery:false,
              where: { categoryId: cat.id, status: "active" },
              include: [
                { model: db.productphoto, attributes: ["id", "imgUrl"] },
                {
                  model: db.ProductVariant,
                  separate: true,
                  order: [cond],
                },
              ],
              limit: limit,
              offset: offset,
            })
            .then((count) => {
              let pages = Math.ceil(count / limit);
              offset = limit * (page - 1);
              return db.product
                .findAll({
                  // subQuery:false,
                  where: { categoryId: cat.id, status: "active" },
                  include: [
                    { model: db.productphoto, attributes: ["id", "imgUrl"] },
                    {
                      model: db.ProductVariant,
                      separate: true,
                      order: [cond],
                    },
                  ],
                  limit: limit,
                  offset: offset,
                })
                .then((r) => [r, pages, count]);
            })
            .then(([list, pages, count]) => {
              res.status(200).json({ data: list, count: count, pages: pages });
            })
            .catch(function (err) {
              console.log(err);
              res.status(500).json({ success: false, error: err });
            });
        });
    } catch (err) {
      console.log("new error", err);
      res.status(500).json({ success: false, error: err });
    }
  },
  // color details
  async createColorDetails(req, res, next) {
    const { name, code } = req.body;
    try {
      db.ch_color_detail
        .findOne({ where: { name: name } })
        .then((list) => {
          if (!list) {
            return db.ch_color_detail.create({
              TITLE: name,
              STATUS: 1,
              CODE: code,
              thumbnail: req.file ? req.file.location : data.thumbnail,
            });
          }
          return true;
        })
        .then((success) => {
          res
            .status(200)
            .json({ status: 200, message: "Succesffully added in list" });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError(err);
    }
  },
  async updateColorDetails(req, res, next) {
    try {
      const { id, name, thumbnail } = req.body;
      db.ch_color_detail
        .findOne({ where: { id: id } })
        .then((data) => {
          if (data) {
            return db.ch_color_detail.update(
              {
                TITLE: name ? name : data.name,
                thumbnail: req.file ? req.file.location : data.thumbnail,
              },
              { where: { id: data.id } }
            );
          }
          throw new RequestError("color is not found");
        })
        .then((category) => {
          var response = Util.getFormatedResponse(false, {
            message: "Successfully Updated",
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
  async getColorList(req, res, next) {
    const { search_text } = req.body;
    let limit = 20;
    let offset = 0;
    let page = 1;
    if (req.body.limit != undefined) {
      limit = parseInt(req.body.limit);
    }
    if (req.body.page) {
      page = req.body.page;
      if (page < 1) page = 1;
    }
    try {
      let whereCond = {};
      if (search_text) {
        whereCond = {
          TITLE: {
            [Op.like]: "%" + search_text + "%",
          },
        };
      }
      db.ch_color_detail
        .count({ where: whereCond, order: [["createdAt", "DESC"]] })
        .then((count) => {
          let pages = Math.ceil(count / limit);
          offset = limit * (page - 1);
          return db.ch_color_detail
            .findAll({
              where: whereCond,
              order: [["createdAt", "DESC"]],
              order: [
                ["id", "DESC"],
                ["TITLE", "ASC"],
              ],
              limit: limit,
              offset: offset,
            })
            .then((r) => [r, pages, count]);
        })
        .then(([list, pages, count]) => {
          res.status(200).json({
            status: 200,
            data: list,
            count: count,
            pages: pages,
            page: req.body.page,
          });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError(err);
    }
  },
  async deleteColorById(req, res, next) {
    try {
      const { id } = req.query;
      db.ch_color_detail
        .findOne({ where: { id: id } })
        .then((data) => {
          if (data) {
            return db.ch_color_detail.destroy({ where: { id: id } });
          }
          throw new RequestError("data is not found");
        })
        .then((success) => {
          res.status(200).json({
            status: 200,
            success: true,
            message: "Successflly deleted",
          });
        });
    } catch (err) {
      throw new RequestError(err);
    }
  },
  async productColourList(req, res, next) {
    try {
      db.ch_color_detail
        .findAll({
          where: { STATUS: true },
        })
        .then((success) => {
          res.status(200).json({
            status: 200,
            success: true,
            message: "Successflly",
            data: success,
          });
        })
        .catch((err) => {
          throw new RequestError(err);
        });
    } catch (err) {
      throw new RequestError(err);
    }
  },
  async getTag(req, res, next) {
    let limit = 40;
    let page = 1;
    if (req.body.limit != undefined) {
      limit = parseInt(req.body.limit);
    }
    if (req.body.page) {
      page = req.body.page;
      if (page < 1) page = 1;
    }
    try {
      db.tag
        .findAll({
          include: [
            {
              model: db.product,
              as: "product",
              attributes: ["name"],
              where: { SellerId: req.user.id },
            },
          ],
        })
        .then((list) => {
          var response = Util.getFormatedResponse(false, list, {
            message: "Success",
          });
          res.status(response.code).json(response);
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      next(err);
    }
  },
  async getTag(req, res, next) {
    const { searchString } = req.query;
    const arrData = [];
    const query = {};
    query.where = {};
    if (searchString) {
      query.where = {
        [Op.or]: [
          {
            title: {
              [Op.like]: "%" + searchString + "%",
            },
          },
          {
            productId: {
              [Op.like]: "%" + searchString + "%",
            },
          },
        ],
      };
    }
    //limit
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const page = req.query.page ? Number(req.query.page) : 1;
    query.limit = limit;
    query.offset = limit * (page - 1);
    query.order = [["createdAt", "Desc"]];
    try {
      db.tag
        .findAndCountAll({
          ...query,
          include: [
            {
              model: db.product,
              as: "product",
              attributes: ["name"],
              where: { SellerId: req.user.id },
            },
          ],
        })
        .then((list) => {
          list.rows.forEach((value) => {
            const data = {
              id: value.id,
              title: value.title,
              productName: value.product?.name + "( " + value.productId + " )",
            };
            arrData.push(data);
          });
          let pages = Math.ceil(list.count / limit);
          const finalResult = {
            count: list.count,
            pages: pages,
            page: req.query.page,
            items: arrData,
          };
          let response = Util.getFormatedResponse(false, finalResult, {
            message: "Success",
          });
          res.status(response.code).json(response);
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      next(err);
    }
  },
  async getDeleteTag(req, res, next) {
    try {
      db.tag
        .findOne({
          where: { id: req.query.id },
        })
        .then((list) => {
          if (list) {
            return db.tag.destroy({ where: { id: list.id } });
          }
          throw new RequestError("Tag is not found");
        })
        .then((success) => {
          res
            .status(200)
            .json({ status: 200, success: true, message: "Success deleted" });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      next(err);
    }
  },
  async createProcessor(req, res, next) {
    try {
      const { name, type } = req.body;
      db.processor
        .findOne({ where: { name: name } })
        .then((data) => {
          if (!data) {
            return db.processor.create({
              name: name,
              type: type,
            });
          }
          throw new RequestError("already exist in list");
        })
        .then((success) => {
          res
            .status(200)
            .json({ status: 200, success: true, message: "Successflly added" });
        })
        .catch((err) => {
          throw new RequestError(err);
        });
    } catch (err) {
      throw new RequestError(err);
    }
  },

  async getProcessorList(req, res, next) {
    const { search_text } = req.body;
    let limit = 20;
    let offset = 0;
    let page = 1;
    if (req.body.limit != undefined) {
      limit = parseInt(req.body.limit);
    }
    if (req.body.page) {
      page = req.body.page;
      if (page < 1) page = 1;
    }
    try {
      let whereCond = {};
      if (search_text) {
        whereCond = {
          TITLE: {
            [Op.like]: "%" + search_text + "%",
          },
        };
      }
      db.processor
        .count({ where: whereCond, order: [["createdAt", "DESC"]] })
        .then((count) => {
          let pages = Math.ceil(count / limit);
          offset = limit * (page - 1);
          return db.processor
            .findAll({
              where: whereCond,
              order: [["createdAt", "DESC"]],
              order: [
                ["id", "DESC"],
                ["TITLE", "ASC"],
              ],
              limit: limit,
              offset: offset,
            })
            .then((r) => [r, pages, count]);
        })
        .then(([list, pages, count]) => {
          res.status(200).json({
            status: 200,
            data: list,
            count: count,
            pages: pages,
            page: req.body.page,
          });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError(err);
    }
  },

  async deleteProcessorById(req, res, next) {
    try {
      const { id } = req.query;
      db.processor
        .findOne({ where: { id: id } })
        .then((data) => {
          if (data) {
            return db.processor.destroy({ where: { id: id } });
          }
          throw new RequestError("data is not found");
        })
        .then((success) => {
          res.status(200).json({
            status: 200,
            success: true,
            message: "Successflly deleted",
          });
        });
    } catch (err) {
      throw new RequestError(err);
    }
  },
};
