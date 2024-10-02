import { db } from "../../../models";
import mailer from "../../../mailer";
let Util = require("../../../helpers/Util");
const { Op } = require("sequelize");
let Sequelize = require("sequelize");
const dummyList = require("../../../config/dummy.json");
import moment from "moment";

const findAddressList = (id) => {
  return new Promise((resolve, reject) => {
    db.Address.findOne({
      where: {
        id: id,
      },
    })
      .then((list) => {
        return list;
      })
      .then((r) => {
        resolve(r);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const getUniqueListBy = (arr, key) => {
  try {
    return [...new Map(arr.map((item) => [item[key], item])).values()];
  } catch (error) {
    throw new RequestError(error);
  }
};

const filterSellerProduct = (arr1, arr2) => {
  const temp = [];
  arr1.forEach((x) => {
    arr2.forEach((y) => {
      if (x.productId === y.id) {
        let sellerIds = JSON.parse(JSON.stringify(y));
        temp.push({ ...x, ...sellerIds });
      }
    });
  });

  return temp;
};
const checkEmpty = (arr) => {
  return arr.filter(function (e) {
    return e.id != null;
  });
};
const uniqueArr = (arr) => {
  return arr.reduce((unique, o) => {
    if (!unique.some((obj) => obj.id === o.id)) {
      unique.push(o);
    }
    return unique;
  }, []);
};
export default {
  async getCategoryList(req, res, next) {
    try {
      db.category
        .findAll({
          order: [["id", "desc"]],
          where: { status: true },
          attributes: ["id", "name", "thumbnail", "slug"],
          include: [
            {
              model: db.SubCategory,
              order: [["id", "asc"]],
              attributes: ["id", "sub_name", "slug"],
              include: [
                {
                  model: db.SubChildCategory,
                  order: [["id", "asc"]],
                  attributes: ["id", "name"],
                },
              ],
            },
          ],
        })
        .then((list) => {
          res.status(200).json({
            status: 200,
            message: "Successfully",
            success: true,
            data: list,
          });
        });
    } catch (err) {
      throw new RequestError(err);
    }
  },
  async getBannerList(req, res, next) {
    try {
      const { type } = req.query;
      db.BannerDetail.findAll({
        where: { status: 1, type: type },
        attributes: ["id", "banner", "slug"],
      }).then((list) => {
        let response = Util.getFormatedResponse(false, list, {
          message: "Success",
        });
        res.status(response.code).json(response);
      });
    } catch (err) {
      throw new RequestError(err);
    }
  },
  async getNewArrival(req, res, next) {
    const limit = 100;
    const query = {};
    query.where = {};
    query.include = [
      {
        model: db.ProductVariant,
        where: {
          [Op.or]: [
            {
              createdAt: {
                [Op.gte]: moment().subtract(90, "days").toDate(),
              },
            },
            {
              updatedAt: {
                [Op.gte]: moment().subtract(90, "days").toDate(),
              },
            },
          ],
        },
        include: [
          {
            model: db.ch_brand_detail,
            as: "brand",
            attributes: ["id", "name", "slug"],
          },
          {
            model: db.ch_color_detail,
            as: "color",
            attributes: ["id", "TITLE", "CODE"],
          },
        ],
      },
    ];
    query.limit = limit;
    query.order = [["id", "DESC"]];
    query.where = {
      [Op.or]: [
        {
          createdAt: {
            [Op.gte]: moment().subtract(25, "days").toDate(),
          },
        },
        {
          updatedAt: {
            [Op.gte]: moment().subtract(25, "days").toDate(),
          },
        },
      ],
    };
    query.where.SellerId = {
      [Op.ne]: null,
    };
    query.where.name = {
      [Op.ne]: null,
    };
    query.where.PubilshStatus = {
      [Op.eq]: "Published",
    };
    try {
      let product = await db.product.findAndCountAll({ ...query });
      if (product.count) {
        const arrData = [];
        product.rows.forEach((value) => {
          const dataList = {
            ProductId: value.id,
            PubilshStatus: value.PubilshStatus,
            HighLightDetail: value.HighLightDetail,
            VarientId: value.ProductVariants[0]
              ? value.ProductVariants[0].id
              : null,
            Name: value.name,
            slug: value.slug,
            qty: value.ProductVariants[0] ? value.ProductVariants[0].qty : null,
            Thumbnail: value.ProductVariants[0].thumbnail,
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
            badges: "new",
          };
          arrData.push(dataList);
        });
        let pages = Math.ceil(product.count / limit);
        const finalResult = {
          count: product.count,
          pages: pages,
          items: arrData,
        };
        var response = Util.getFormatedResponse(false, finalResult, {
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
      throw new RequestError(err);
    }
  },
  async PreownedProduct(req, res, next) {
    const catId = await db.category.findOne({
      attributes: ["id"],
      where: { slug: "mobile-phone" },
    });
    const query = {};
    const limit = 50;
    query.where = {};
    query.include = [
      {
        model: db.ProductVariant,
        include: [
          {
            model: db.ch_brand_detail,
            as: "brand",
            attributes: ["id", "name", "slug"],
          },
          {
            model: db.ch_color_detail,
            as: "color",
            attributes: ["id", "TITLE", "CODE"],
          },
        ],
      },
    ];
    query.order = [["createdAt", "DESC"]];
    query.where.SellerId = {
      [Op.ne]: null,
    };
    query.where.name = {
      [Op.ne]: null,
    };
    query.where.PubilshStatus = {
      [Op.eq]: "Published",
    };
    query.limit = limit;
    try {
      if (catId.id) {
        query.where.categoryId = catId.id;
        let product = await db.product.findAll({ ...query });
        if (product.length > 0) {
          const arrData = [];
          product.forEach((value) => {
            const dataList = {
              ProductId: value.id,
              VarientId: value.ProductVariants[0]
                ? value.ProductVariants[0].id
                : null,
              Name: value.name,
              slug: value.slug,
              qty: value.ProductVariants[0]
                ? value.ProductVariants[0].qty
                : null,
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
          const finalResult = await Promise.all(arrData);
          const response = Util.getFormatedResponse(false, finalResult, {
            message: "Success",
          });
          res.status(response.code).json(response);
        } else {
          var response = Util.getFormatedResponse(false, {
            message: "No data found",
          });
          res.status(response.code).json(response);
        }
      }
    } catch (err) {
      console.log(err);
      throw new RequestError(err);
    }
  },
  async getProductDetail(req, res, next) {
    const { slug } = req.query;
    let internal_memory = [];
    let version = [];
    //filter
    const query = {};
    query.where = {};
    if (req.query.internal_memory) {
      query.where.memory = req.query.internal_memory;
    }
    if (req.query.version) {
      query.where.internationalWarranty = req.query.version;
    }
    if (req.query.color) {
      query.where.colorId = Number(req.query.color);
    }
    query.where.productId = req.query.productId;
    query.include = [
      {
        model: db.ch_brand_detail,
        as: "brand",
        attributes: ["id", "name"],
      },
      { model: db.ch_color_detail, as: "color" },
      {
        model: db.productphoto,
        attributes: ["id", "imgUrl"],
        order: [["createdAt", "DESC"]],
      },
      {
        model: db.product,
        attributes: [
          "id",
          "name",
          "slug",
          "sellerId",
          "WarrantyType",
          "WarrantyPeriod",
          "LocalDeiveryCharge",
          "WarrantyType",
          "WarrantyPeriod",
          "PubilshStatus",
          "ShippingDays",
          "HighLightDetail",
        ],
        include: [
          { model: db.category, attributes: ["name"], as: "maincat" },
          { model: db.SubCategory, attributes: ["sub_name"] },
          { model: db.SubChildCategory, attributes: ["name"] },
          { model: db.ch_specification },
          {
            model: db.user,
            as: "users",
            attributes: ["id", "email"],
            include: [
              {
                model: db.ch_seller_shopdetail,
                attributes: ["id", "SELLERID", "SHOPNAME"],
              },
            ],
          },
          {
            model: db.Seo_Details,
            attributes: ["meta_title", "meta_keyword", "meta_desc"],
          },
        ],
      },
    ];
    try {
      const variant = await db.ProductVariant.findOne({ ...query });
      if (variant && variant.id) {
        query.where.productId = variant.productId;
        db.ProductVariant.findAll({
          where: {
            productId: variant.productId,
          },
          attributes: ["slug", "colorId", "memory", "internationalWarranty"],
          include: [
            {
              model: db.ch_color_detail,
              as: "color",
              attributes: ["id", "TITLE", "CODE", "thumbnail"],
            },
          ],
        })
          .then((list) => {
            if (list.length && list !== null) {
              const colorArr = [];
              const imageList = [];
              variant.productphotos.forEach((url) => {
                imageList.push(url.imgUrl);
              });
              list.forEach((value) => {
                if (value.color != null && value) {
                  colorArr.push({
                    id: value.color?.id,
                    // productSlug: value.slug,
                    TITLE: value.color?.TITLE,
                    CODE: value.color?.CODE,
                    thumbnail: value.color?.thumbnail,
                  });
                }
                if (value.memory != null) {
                  internal_memory.push({ id: value.memory });
                }
                if (value.internationalWarranty != null) {
                  version.push({ id: value.internationalWarranty });
                }
              });
              let checkEmptyVersion = checkEmpty(version);
              let checkEmptyMemory = checkEmpty(uniqueArr(internal_memory));
              const finalMemory = dummyList.memory.filter(({ id: id1 }) =>
                uniqueArr(checkEmptyMemory).some(({ id: id2 }) => id2 === id1)
              );
              const finalVersion = dummyList.international_warranty.filter(
                ({ id: id1 }) =>
                  uniqueArr(checkEmptyVersion).some(
                    ({ id: id2 }) => id2 === id1
                  )
              );
              const warranty_type = dummyList.warranty_type.filter(
                (x) => x.id === variant.product.WarrantyType
              );
              const warranty_period = dummyList.warranty_period.filter(
                (x) => x.id === variant.product.WarrantyPeriod
              );
              const versionName = dummyList.international_warranty.filter(
                (x) => x.id === variant.internationalWarranty
              );
              const memoryName = dummyList.memory.filter(
                (x) => x.id === variant.memory
              );
              const seoList = {
                title:
                  variant.product.Seo_Details &&
                  variant.product.Seo_Details.length
                    ? variant.product.Seo_Details[0].meta_title
                    : null,
                keyword:
                  variant.product.Seo_Details &&
                  variant.product.Seo_Details.length
                    ? variant.product.Seo_Details[0].meta_keyword
                    : null,
                desc:
                  variant.product.Seo_Details &&
                  variant.product.Seo_Details.length
                    ? variant.product.Seo_Details[0].meta_desc
                    : null,
              };
              const finalResult = {
                id: variant.id,
                productId: variant.productId,
                MainCat: variant.product.maincat.name,
                SubCat: variant.product.SubCategory.sub_name,
                ChildCat: variant.product.SubChildCategory
                  ? variant.product.SubChildCategory.name
                  : null,
                Name: variant.productName,
                Code: variant.productCode,
                WarrantyType: warranty_type[0],
                WarrantyPeriod: warranty_period[0],
                SoldBy:
                  variant.product.users &&
                  variant.product.users.ch_seller_shopdetails.length
                    ? variant.product.users.ch_seller_shopdetails[0].SHOPNAME
                    : "",
                Thumbnail: variant.productphotos.length
                  ? variant.productphotos[0].imgUrl
                  : variant.thumbnail,
                Quantity: variant.qtyWarning,
                Available: variant.Available,
                StockType: variant.stockType,
                Cod: variant.COD,
                distributorPrice: variant.distributorPrice,
                discount: variant.discount,
                discountPer: variant.discountPer,
                netPrice: variant.netPrice,
                BrandName: variant.brand ? variant.brand.name : "",
                SortDesc: variant.shortDesc,
                LongDesc: variant.longDesc,
                Photo: imageList,
                HighLightDetail: variant.product.HighLightDetail,
                colorList: uniqueArr(colorArr),
                ColorDetail: variant.color,
                Specification: variant.product.ch_specifications,
                memoryId: variant.memory,
                internationalWarrantyId: variant.internationalWarranty,
                seoList: seoList,
                memory: finalMemory,
                version: finalVersion,
                versionName:
                  versionName && versionName.length ? versionName[0].name : "",
                colorName: variant.color?.TITLE,
                memoryName:
                  memoryName.length && memoryName ? memoryName[0].name : "",
              };
              let response = Util.getFormatedResponse(false, finalResult, {
                message: "success",
              });
              res.status(response.code).json(response);
            } else {
              let response = Util.getFormatedResponse(false, {
                message: "No data found",
              });
              res.status(response.code).json(response);
            }
          })
          .catch(function (err) {
            next(err);
          });
      } else {
        let response = Util.getFormatedResponse(false, {
          message: "No data found",
        });
        res.status(response.code).json(response);
      }
    } catch (err) {
      throw new RequestError(err);
    }
  },
  async getCategoryByProduct(req, res, next) {
    const { slug } = req.body;
    try {
      let result = {};
      result.maincat = await db.category.findOne({
        where: { slug: slug, status: "1" },
      });
      result.subcat = await db.SubCategory.findOne({
        where: { slug: slug },
      });
      result.subchild = await db.SubChildCategory.findOne({
        where: { slug: slug },
      });
      if (result.maincat) {
        await db.product
          .findAll({
            where: {
              categoryId: result.maincat.id,
              PubilshStatus: { [Op.eq]: "Published" },
            },
            include: [
              {
                model: db.ProductVariant,
                include: [
                  {
                    model: db.ch_brand_detail,
                    as: "brand",
                    attributes: ["id", "name"],
                  },
                  {
                    model: db.ch_color_detail,
                    as: "color",
                    attributes: ["id", "TITLE", "CODE"],
                  },
                  { model: db.productphoto, attributes: ["id", "imgUrl"] },
                ],
              },
              { model: db.category, as: "maincat", attributes: ["id", "name"] },
              { model: db.SubCategory, attributes: ["id", "sub_name"] },
              { model: db.SubChildCategory, attributes: ["id", "name"] },
            ],
          })
          .then((list) => {
            const arrData = [];
            list.forEach((value) => {
              let dataList = {
                productName: value.ProductVariants[0].productName,
                slug: value.ProductVariants[0].slug,
                Available: value.ProductVariants[0].Available,
                qty: value.ProductVariants[0].qty,
                unitSize: value.ProductVariants[0].unitSize,
                thumbnail: value.ProductVariants[0].thumbnail,
                gallery: value.ProductVariants[0].productphotos,
                youTubeUrl: value.ProductVariants[0].youTubeUrl,
                qtyWarning: value.ProductVariants[0].qtyWarning,
                shortDesc: value.ProductVariants[0].shortDesc,
                longDesc: value.ProductVariants[0].longDesc,
                distributorPrice: value.ProductVariants[0].distributorPrice,
                netPrice: value.ProductVariants[0].netPrice,
                discount: Math.round(
                  value.ProductVariants[0].distributorPrice -
                    value.ProductVariants[0].netPrice
                ),
                discountPer: Math.round(
                  (value.ProductVariants[0].distributorPrice -
                    value.ProductVariants[0].netPrice) /
                    100
                ),
                maincat: value.maincat.name,
                subcat: value.SubCategory.sub_name,
                childcat: value.SubChildCategory.name,
                LocalDeiveryCharge: value.LocalDeiveryCharge,
                ZonalDeiveryCharge: value.ZonalDeiveryCharge,
                NationalDeiveryCharge: value.NationalDeiveryCharge,
                WarrantyType: value.WarrantyType,
                WarrantyPeriod: value.WarrantyPeriod,
                HighLightDetail: value.HighLightDetail,
                ShippingDays: value.ShippingDays,
              };
              arrData.push(dataList);
            });
            res.status(200).json({ status: 200, success: true, data: arrData });
          })
          .catch(function (err) {
            next(err);
          });
      }
      if (result.subcat) {
        await db.product
          .findAll({
            where: { subCategoryId: result.subcat.id },
            include: [
              {
                model: db.ProductVariant,
                include: [
                  {
                    model: db.ch_brand_detail,
                    as: "brand",
                    attributes: ["id", "name"],
                  },
                  {
                    model: db.ch_color_detail,
                    as: "color",
                    attributes: ["id", "TITLE", "CODE"],
                  },
                  { model: db.productphoto, attributes: ["id", "imgUrl"] },
                ],
              },
              { model: db.category, as: "maincat", attributes: ["id", "name"] },
              { model: db.SubCategory, attributes: ["id", "sub_name"] },
              { model: db.SubChildCategory, attributes: ["id", "name"] },
            ],
          })
          .then((list) => {
            const arrData = [];
            list.forEach((value) => {
              let dataList = {
                productName: value.ProductVariants[0].productName,
                slug: value.ProductVariants[0].slug,
                Available: value.ProductVariants[0].Available,
                qty: value.ProductVariants[0].qty,
                unitSize: value.ProductVariants[0].unitSize,
                thumbnail: value.ProductVariants[0].thumbnail,
                gallery: value.ProductVariants[0].productphotos,
                youTubeUrl: value.ProductVariants[0].youTubeUrl,
                qtyWarning: value.ProductVariants[0].qtyWarning,
                shortDesc: value.ProductVariants[0].shortDesc,
                longDesc: value.ProductVariants[0].longDesc,
                distributorPrice: value.ProductVariants[0].distributorPrice,
                netPrice: value.ProductVariants[0].netPrice,
                discount: Math.round(
                  value.ProductVariants[0].distributorPrice -
                    value.ProductVariants[0].netPrice
                ),
                discountPer: Math.round(
                  (value.ProductVariants[0].distributorPrice -
                    value.ProductVariants[0].netPrice) /
                    100
                ),
                maincat: value.maincat.name,
                subcat: value.SubCategory.sub_name,
                childcat: value.SubChildCategory.name,
                LocalDeiveryCharge: value.LocalDeiveryCharge,
                ZonalDeiveryCharge: value.ZonalDeiveryCharge,
                NationalDeiveryCharge: value.NationalDeiveryCharge,
                WarrantyType: value.WarrantyType,
                WarrantyPeriod: value.WarrantyPeriod,
                HighLightDetail: value.HighLightDetail,
                ShippingDays: value.ShippingDays,
              };
              arrData.push(dataList);
            });
            res.status(200).json({ status: 200, success: true, data: arrData });
          })
          .catch(function (err) {
            next(err);
          });
      }
      if (result.subchild) {
        await db.product
          .findAll({
            where: { childCategoryId: result.subchild.id },
            include: [
              {
                model: db.ProductVariant,
                include: [
                  {
                    model: db.ch_brand_detail,
                    as: "brand",
                    attributes: ["id", "name"],
                  },
                  {
                    model: db.ch_color_detail,
                    as: "color",
                    attributes: ["id", "TITLE", "CODE"],
                  },
                  { model: db.productphoto, attributes: ["id", "imgUrl"] },
                ],
              },
              { model: db.category, as: "maincat", attributes: ["id", "name"] },
              { model: db.SubCategory, attributes: ["id", "sub_name"] },
              { model: db.SubChildCategory, attributes: ["id", "name"] },
            ],
          })
          .then((list) => {
            const arrData = [];
            list.forEach((value) => {
              let dataList = {
                productName: value.ProductVariants[0].productName,
                slug: value.ProductVariants[0].slug,
                Available: value.ProductVariants[0].Available,
                qty: value.ProductVariants[0].qty,
                unitSize: value.ProductVariants[0].unitSize,
                thumbnail: value.ProductVariants[0].thumbnail,
                gallery: value.ProductVariants[0].productphotos,
                youTubeUrl: value.ProductVariants[0].youTubeUrl,
                qtyWarning: value.ProductVariants[0].qtyWarning,
                shortDesc: value.ProductVariants[0].shortDesc,
                longDesc: value.ProductVariants[0].longDesc,
                distributorPrice: value.ProductVariants[0].distributorPrice,
                netPrice: value.ProductVariants[0].netPrice,
                discount: Math.round(
                  value.ProductVariants[0].distributorPrice -
                    value.ProductVariants[0].netPrice
                ),
                discountPer: Math.round(
                  (value.ProductVariants[0].distributorPrice -
                    value.ProductVariants[0].netPrice) /
                    100
                ),
                maincat: value.maincat.name,
                subcat: value.SubCategory.sub_name,
                childcat: value.SubChildCategory.name,
                LocalDeiveryCharge: value.LocalDeiveryCharge,
                ZonalDeiveryCharge: value.ZonalDeiveryCharge,
                NationalDeiveryCharge: value.NationalDeiveryCharge,
                WarrantyType: value.WarrantyType,
                WarrantyPeriod: value.WarrantyPeriod,
                HighLightDetail: value.HighLightDetail,
                ShippingDays: value.ShippingDays,
              };
              arrData.push(dataList);
            });
            res.status(200).json({ status: 200, success: true, data: arrData });
          })
          .catch(function (err) {
            next(err);
          });
      }
    } catch (err) {
      next(err);
    }
  },
  async getFilterAllProduct(req, res, next) {
    const {
      filter_networkType,
      filter_modelYear,
      filter_os_type,
      filter_memory,
      filter_ram,
      filter_screen_size,
      filter_battery_capacity,
      filter_primary_camera,
      filter_secondary_camera,
      filter_sim_count,
      filter_interface,
      filter_compatibility,
      filter_category,
      filter_brand,
      filter_color,
      filter_price,
    } = req.query;
    let arrData = [];
    const whereCond = {};
    whereCond.where = {};
    const query = {};
    query.where = {};

    if (filter_brand) {
      const brandArr = filter_brand.split(",");
      const brandOr = [];
      for (const brand of brandArr) {
        brandOr.push({
          [Op.like]: `%${brand}`,
        });
      }
      const brandsId = await db.ch_brand_detail.findAll({
        attributes: ["id"],
        where: {
          name: { [Op.or]: brandOr },
        },
        raw: true,
      });
      if (brandsId.length > 0) {
        whereCond.where.brandId = {
          [Op.in]: brandsId.map(({ id }) => id),
        };
      }
    }
    if (filter_color) {
      const colorrr = filter_color.split(",");
      const colorOr = [];
      for (const color of colorrr) {
        colorOr.push({
          [Op.like]: `${color}`,
        });
      }
      const colorsId = await db.ch_color_detail.findAll({
        attributes: ["id"],
        where: {
          TITLE: { [Op.or]: colorOr },
        },
        raw: true,
      });
      if (colorsId.length > 0) {
        whereCond.where.colorId = {
          [Op.in]: colorsId.map(({ id }) => id),
        };
      }
    }
    if (filter_price) {
      const price = filter_price.split("-");
      const startPrice = Number(price[0]);
      const endPrice = Number(price[1]);
      if (startPrice && endPrice) {
        whereCond.where.netPrice = {
          [Op.between]: [startPrice, endPrice],
        };
      }
    }
    if (filter_networkType) {
      const networkType = filter_networkType.split(",");
      whereCond.where.networkType = {
        [Op.in]: networkType,
      };
    }
    if (filter_modelYear) {
      const modelYear = filter_modelYear.split(",");
      whereCond.where.modelYear = {
        [Op.in]: modelYear,
      };
    }
    if (filter_os_type) {
      const osType = filter_os_type.split(",");
      const results = dummyList.os_type.filter(({ slug: id1 }) =>
        osType.some((id2) => id1 === id2)
      );
      let osArr = [];
      for (let i = 0; i < results.length; i++) {
        osArr.push(results[i].id);
      }
      whereCond.where.osType = {
        [Op.in]: osArr,
      };
    }
    if (filter_memory) {
      const memory = filter_memory.split(",");
      const results = dummyList.memory.filter(({ slug: id1 }) =>
        memory.some((id2) => id1 === id2)
      );
      let memoryArr = [];
      for (let i = 0; i < results.length; i++) {
        memoryArr.push(results[i].id);
      }
      console.log(memoryArr);
      whereCond.where.memory = {
        [Op.in]: memoryArr,
      };
    }
    if (filter_memory) {
      const memory = filter_memory.split(",");
      const results = dummyList.memory.filter(({ slug: id1 }) =>
        memory.some((id2) => id1 === id2)
      );
      let memoryArr = [];
      for (let i = 0; i < results.length; i++) {
        memoryArr.push(results[i].id);
      }
      console.log(memoryArr);
      whereCond.where.memory = {
        [Op.in]: memoryArr,
      };
    }
    if (filter_ram) {
      const ram = filter_ram.split(",");
      whereCond.where.unitSize = {
        [Op.in]: ram,
      };
    }
    if (filter_screen_size) {
      const screenSize = filter_screen_size.split(",");
      const results = dummyList.screen_size.filter(({ slug: id1 }) =>
        screenSize.some((id2) => id1 === id2)
      );
      let screenSizeArr = [];
      for (let i = 0; i < results.length; i++) {
        screenSizeArr.push(results[i].id);
      }
      whereCond.where.screenSize = {
        [Op.in]: screenSizeArr,
      };
    }
    if (filter_battery_capacity) {
      const batteryCapacity = filter_battery_capacity.split(",");
      const results = dummyList.battery_capacity.filter(({ slug: id1 }) =>
        batteryCapacity.some((id2) => id1 === id2)
      );
      let batteryCapacityArr = [];
      for (let i = 0; i < results.length; i++) {
        batteryCapacityArr.push(results[i].id);
      }
      whereCond.where.batteryCapacity = {
        [Op.in]: batteryCapacityArr,
      };
    }
    if (filter_primary_camera) {
      const primaryCamera = filter_primary_camera.split(",");
      const results = dummyList.primary_camera.filter(({ slug: id1 }) =>
        primaryCamera.some((id2) => id1 === id2)
      );
      let primaryCameraArr = [];
      for (let i = 0; i < results.length; i++) {
        primaryCameraArr.push(results[i].id);
      }
      whereCond.where.primaryCamera = {
        [Op.in]: primaryCameraArr,
      };
    }
    if (filter_secondary_camera) {
      const secondaryCamera = filter_secondary_camera.split(",");
      const results = dummyList.secondary_camera.filter(({ slug: id1 }) =>
        secondaryCamera.some((id2) => id1 === id2)
      );
      let secondaryCameraArr = [];
      for (let i = 0; i < results.length; i++) {
        secondaryCameraArr.push(results[i].id);
      }
      whereCond.where.secondaryCamera = {
        [Op.in]: secondaryCameraArr,
      };
    }
    if (filter_sim_count) {
      const simCount = filter_sim_count.split(",");
      const results = dummyList.sim_count.filter(({ slug: id1 }) =>
        simCount.some((id2) => id1 === id2)
      );
      let simCountArr = [];
      for (let i = 0; i < results.length; i++) {
        simCountArr.push(results[i].id);
      }
      whereCond.where.simCount = {
        [Op.in]: simCountArr,
      };
    }
    if (filter_interface) {
      const interfaceData = filter_interface.split(",");
      const results = dummyList.interface.filter(({ slug: id1 }) =>
        interfaceData.some((id2) => id1 === id2)
      );
      let intefaceArr = [];
      for (let i = 0; i < results.length; i++) {
        intefaceArr.push(results[i].id);
      }
      whereCond.where.interface = {
        [Op.in]: intefaceArr,
      };
    }
    if (filter_compatibility) {
      const compatibility = filter_compatibility.split(",");
      const results = dummyList.compatibility.filter(({ slug: id1 }) =>
        compatibility.some((id2) => id1 === id2)
      );
      let compatibilityArr = [];
      for (let i = 0; i < results.length; i++) {
        compatibilityArr.push(results[i].id);
      }
      whereCond.where.compatibility = {
        [Op.in]: compatibilityArr,
      };
    }
    try {
      let result = {};
      result.tag = await db.tag.findAll({
        attributes: ["id", "title", "productId"],
        where: { title: { [Op.like]: `%${filter_category}%` } },
      });
      result.maincat = await db.category.findOne({
        attributes: ["id", "name", "slug", "title", "keyword", "desc"],
        where: {
          [Op.or]: [
            { slug: { [Op.like]: `%${filter_category}%` } },
            { name: { [Op.like]: `%${filter_category}%` } },
          ],
        },
      });
      result.subcat = await db.SubCategory.findOne({
        where: {
          [Op.or]: [{ slug: filter_category }, { sub_name: filter_category }],
        },
      });
      result.subchild = await db.SubChildCategory.findOne({
        where: {
          [Op.or]: [{ slug: filter_category }, { name: filter_category }],
        },
      });
      result.brand = await db.ch_brand_detail.findOne({
        where: {
          [Op.or]: [{ slug: filter_category }, { name: filter_category }],
        },
      });
      result.varient = await db.ProductVariant.findOne({
        where: {
          [Op.or]: [
            { productName: { [Op.like]: `%${filter_category}%` } },
            { slug: { [Op.like]: `%${filter_category}%` } },
          ],
        },
        attributes: ["productName", "productId"],
      });
      result.shop = await db.ch_seller_shopdetail.findOne({
        attributes: ["id", "SELLERID", "SHOPNAME"],
        where: {
          SHOPNAME: { [Op.like]: `%${filter_category}%` },
        },
      });
      //limit
      const limit = req.query.limit ? Number(req.query.limit) : 30;
      const page = req.query.page ? Number(req.query.page) : 1;
      query.offset = (page - 1) * limit;
      query.limit = limit;
      query.order = [["id", "DESC"]];
      query.attributes = [
        "id",
        "name",
        "slug",
        "SellerId",
        "PubilshStatus",
        "categoryId",
        "subCategoryId",
        "HighLightDetail",
        "childCategoryId",
      ];
      query.include = [
        {
          model: db.ProductVariant,
          ...whereCond,
          attributes: [
            "id",
            "productName",
            "qty",
            "brandId",
            "thumbnail",
            "distributorPrice",
            "netPrice",
            "discount",
            "discountPer",
          ],
          include: [{ model: db.productphoto, attributes: ["id", "imgUrl"] }],
        },
      ];
      if (result.tag && result.tag.length) {
        const productIds = result.tag.map(({ productId }) => productId);
        query.where = {
          id: { [Op.in]: productIds },
        };
        query.where.PubilshStatus = {
          [Op.eq]: "Published",
        };
        let product = await db.product.findAndCountAll({ ...query });
        if (product.count) {
          product.rows.forEach((value) => {
            const dataList = {
              ProductId: value.id,
              VarientId: value.ProductVariants[0]
                ? value.ProductVariants[0].id
                : null,
              Name: value.name,
              slug: value.slug,
              qty: value.ProductVariants[0]
                ? value.ProductVariants[0].qty
                : null,
              Thumbnail: value.ProductVariants[0].thumbnail,
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
              HighLightDetail: value.HighLightDetail,
            };
            arrData.push(dataList);
          });

          let pages = Math.ceil(product.count / limit);
          const SeoList = {
            Title:
              result.subcat && result.subcat.title ? result.subcat.title : null,
            Keyword:
              result.subcat && result.subcat.keyword
                ? result.subcat.keyword
                : null,
            Desc:
              result.subcat && result.subcat.desc ? result.subcat.desc : null,
          };
          const finalResult = {
            count: product.rows.length,
            pages: pages,
            items: arrData,
            SeoList: SeoList,
          };
          var response = Util.getFormatedResponse(false, finalResult, {
            message: "Success",
          });
          res.status(response.code).json(response);
        } else {
          var response = Util.getFormatedResponse(false, {
            message: "No data found",
          });
          res.status(response.code).json(response);
        }
      } else if (result.maincat) {
        query.where = {
          [Op.and]: [
            {
              categoryId: result.maincat.id,
            },
            {
              SellerId: { [Op.ne]: null },
            },
          ],
        };
        query.where.PubilshStatus = {
          [Op.eq]: "Published",
        };
        let product = await db.product.findAndCountAll({ ...query });
        if (product.count) {
          const arrData = [];
          product.rows.forEach((value) => {
            const dataList = {
              ProductId: value.id,
              VarientId: value.ProductVariants[0]
                ? value.ProductVariants[0].id
                : null,
              Name: value.name,
              slug: value.slug,
              brandId: value.ProductVariants[0]
                ? value.ProductVariants[0].brandId
                : null,
              qty: value.ProductVariants[0]
                ? value.ProductVariants[0].qty
                : null,
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
              HighLightDetail: value.HighLightDetail,
            };
            arrData.push(dataList);
          });

          let pages = Math.ceil(product.count / limit);
          const SeoList = {
            Title:
              result.maincat && result.maincat.title
                ? result.maincat.title
                : null,
            Keyword:
              result.maincat && result.maincat.keyword
                ? result.maincat.keyword
                : null,
            Desc:
              result.maincat && result.maincat.desc
                ? result.maincat.desc
                : null,
          };
          const finalResult = {
            count: product.rows.length,
            pages: pages,
            items: arrData,
            SeoList: SeoList,
          };
          var response = Util.getFormatedResponse(false, finalResult, {
            message: "Success",
          });
          res.status(response.code).json(response);
        } else {
          var response = Util.getFormatedResponse(false, {
            message: "No data found",
          });
          res.status(response.code).json(response);
        }
      } else if (result.subcat) {
        query.where = {
          [Op.and]: [
            {
              subCategoryId: result.subcat.id,
            },
            {
              SellerId: { [Op.ne]: null },
            },
          ],
        };
        query.where.PubilshStatus = {
          [Op.eq]: "Published",
        };
        let product = await db.product.findAndCountAll({ ...query });
        if (product.count) {
          product.rows.forEach((value) => {
            const dataList = {
              ProductId: value.id,
              VarientId: value.ProductVariants[0]
                ? value.ProductVariants[0].id
                : null,
              Name: value.name,
              slug: value.slug,
              qty: value.ProductVariants[0]
                ? value.ProductVariants[0].qty
                : null,
              Thumbnail: value.ProductVariants[0].thumbnail,
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
              HighLightDetail: value.HighLightDetail,
            };
            arrData.push(dataList);
          });

          let pages = Math.ceil(product.count / limit);
          const SeoList = {
            Title:
              result.subcat && result.subcat.title ? result.subcat.title : null,
            Keyword:
              result.subcat && result.subcat.keyword
                ? result.subcat.keyword
                : null,
            Desc:
              result.subcat && result.subcat.desc ? result.subcat.desc : null,
          };
          const finalResult = {
            count: product.rows.length,
            pages: pages,
            items: arrData,
            SeoList: SeoList,
          };
          var response = Util.getFormatedResponse(false, finalResult, {
            message: "Success",
          });
          res.status(response.code).json(response);
        } else {
          var response = Util.getFormatedResponse(false, {
            message: "No data found",
          });
          res.status(response.code).json(response);
        }
      } else if (result.subchild) {
        query.where = {
          [Op.and]: [
            {
              childCategoryId: result.subchild.id,
            },
            {
              SellerId: { [Op.ne]: null },
            },
          ],
        };
        query.where.PubilshStatus = {
          [Op.eq]: "Published",
        };
        let product = await db.product.findAndCountAll({ ...query });
        if (product.count) {
          product.rows.forEach((value) => {
            const dataList = {
              ProductId: value.id,
              VarientId: value.ProductVariants[0]
                ? value.ProductVariants[0].id
                : null,
              Name: value.name,
              slug: value.slug,
              qty: value.ProductVariants[0]
                ? value.ProductVariants[0].qty
                : null,
              Thumbnail: value.ProductVariants[0].thumbnail,
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
              HighLightDetail: value.HighLightDetail,
              badges: "new",
            };
            arrData.push(dataList);
          });
          let pages = Math.ceil(product.count / limit);
          const SeoList = {
            Title:
              result.subchild && result.subchild.title
                ? result.subchild.title
                : null,
            Keyword:
              result.subchild && result.subchild.keyword
                ? result.subchild.keyword
                : null,
            Desc:
              result.subchild && result.subchild.desc
                ? result.subchild.desc
                : null,
          };
          const finalResult = {
            count: product.rows.length,
            pages: pages,
            items: arrData,
            SeoList: SeoList,
          };
          var response = Util.getFormatedResponse(false, finalResult, {
            message: "Success",
          });
          res.status(response.code).json(response);
        } else {
          var response = Util.getFormatedResponse(false, {
            message: "No data found",
          });
          res.status(response.code).json(response);
        }
      } else if (result.brand) {
        whereCond.where.brandId = result.brand.id;
        query.where.PubilshStatus = {
          [Op.eq]: "Published",
        };
        let product = await db.product.findAndCountAll({ ...query });
        if (product.count) {
          product.rows.forEach((value) => {
            const dataList = {
              ProductId: value.id,
              VarientId: value.ProductVariants[0]
                ? value.ProductVariants[0].id
                : null,
              Name: value.name,
              slug: value.slug,
              qty: value.ProductVariants[0]
                ? value.ProductVariants[0].qty
                : null,
              Thumbnail: value.ProductVariants[0].thumbnail,
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
              HighLightDetail: value.HighLightDetail,
            };
            arrData.push(dataList);
          });
          const SeoList = {
            Title:
              result.brand && result.brand.title ? result.brand.title : null,
            Keyword:
              result.brand && result.brand.keyword
                ? result.brand.keyword
                : null,
            Desc: result.brand && result.brand.desc ? result.brand.desc : null,
          };
          let pages = Math.ceil(product.count / limit);
          const finalResult = {
            count: product.rows.length,
            pages: pages,
            items: arrData,
            SeoList: SeoList,
          };
          var response = Util.getFormatedResponse(false, finalResult, {
            message: "Success",
          });
          res.status(response.code).json(response);
        } else {
          var response = Util.getFormatedResponse(false, {
            message: "No data found",
          });
          res.status(response.code).json(response);
        }
      } else if (result.varient) {
        query.where.id = result.varient.productId;
        query.where.PubilshStatus = {
          [Op.eq]: "Published",
        };
        let product = await db.product.findAndCountAll({ ...query });
        if (product.count) {
          product.rows.forEach((value) => {
            const dataList = {
              ProductId: value.id,
              VarientId: value.ProductVariants[0]
                ? value.ProductVariants[0].id
                : null,
              Name: value.name,
              slug: value.slug,
              qty: value.ProductVariants[0]
                ? value.ProductVariants[0].qty
                : null,
              Thumbnail: value.ProductVariants[0].thumbnail,
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
              HighLightDetail: value.HighLightDetail,
            };
            arrData.push(dataList);
          });
          let pages = Math.ceil(product.count / limit);
          const finalResult = {
            count: product.rows.length,
            pages: pages,
            items: arrData,
          };
          var response = Util.getFormatedResponse(false, finalResult, {
            message: "Success",
          });
          res.status(response.code).json(response);
        } else {
          var response = Util.getFormatedResponse(false, {
            message: "No data found",
          });
          res.status(response.code).json(response);
        }
      } else if (result.shop) {
        query.where = {
          [Op.and]: [
            {
              PubilshStatus: { [Op.eq]: "Published" },
            },
            {
              SellerId: result.shop.SELLERID,
            },
          ],
        };
        let product = await db.product.findAndCountAll({ ...query });
        if (product.count) {
          const arrData = [];
          product.rows.forEach((value) => {
            const dataList = {
              ProductId: value.id,
              VarientId: value.ProductVariants[0]
                ? value.ProductVariants[0].id
                : null,
              Name: value.name,
              slug: value.slug,
              brandId: value.ProductVariants[0]
                ? value.ProductVariants[0].brandId
                : null,
              qty: value.ProductVariants[0]
                ? value.ProductVariants[0].qty
                : null,
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
              HighLightDetail: value.HighLightDetail,
            };
            arrData.push(dataList);
          });

          let pages = Math.ceil(product.count / limit);
          const SeoList = {
            Title:
              result.maincat && result.maincat.title
                ? result.maincat.title
                : null,
            Keyword:
              result.maincat && result.maincat.keyword
                ? result.maincat.keyword
                : null,
            Desc:
              result.maincat && result.maincat.desc
                ? result.maincat.desc
                : null,
          };
          const finalResult = {
            count: product.rows.length,
            pages: pages,
            items: arrData,
            SeoList: SeoList,
          };
          var response = Util.getFormatedResponse(false, finalResult, {
            message: "Success",
          });
          res.status(response.code).json(response);
        } else {
          var response = Util.getFormatedResponse(false, {
            message: "No data found",
          });
          res.status(response.code).json(response);
        }
      } else {
        var response = Util.getFormatedResponse(false, {
          message: "No data found",
        });
        res.status(response.code).json(response);
      }
    } catch (err) {
      throw new RequestError(err);
    }
  },
  async getFilterAllCategoryBrand(req, res, next) {
    const { queryString } = req.query;
    let BrandData = [];
    let ColorData = [];
    let processorData = [];
    let networkTypeData = [];
    let modelYearData = [];
    let osTypeData = [];
    let internalMemoryData = [];
    let screenSizeData = [];
    let ramData = [];
    let batteryCapacityData = [];
    let primaryCameraData = [];
    let secondaryCameraData = [];
    let simCountData = [];
    let interfaceData = [];
    let compatibilityData = [];
    const query = {};
    query.where = {};
    try {
      let search = "%%";
      if (queryString) {
        search = "%" + queryString + "%";
      }
      let result = {};
      result.maincat = await db.category.findAll({
        attributes: ["id", "name", "slug", "title", "keyword", "desc"],
        where: {
          [Op.or]: [
            { slug: { [Op.like]: search } },
            { name: { [Op.like]: search } },
          ],
        },
        include: [
          { model: db.SubCategory, attributes: ["id", "sub_name", "slug"] },
        ],
      });
      result.subcat = await db.SubCategory.findAll({
        where: {
          [Op.or]: [
            { slug: { [Op.like]: search } },
            { sub_name: { [Op.like]: search } },
          ],
        },
        include: [
          {
            model: db.SubChildCategory,
            attributes: ["id", "name", "slug"],
          },
        ],
      });
      result.subchild = await db.SubChildCategory.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: search } },
            { slug: { [Op.like]: search } },
          ],
        },
      });
      result.brand = await db.ch_brand_detail.findAll({
        where: {
          [Op.or]: [
            { slug: { [Op.like]: search } },
            { name: { [Op.like]: search } },
          ],
        },
      });
      query.include = [
        {
          model: db.ProductVariant,
          include: [
            {
              model: db.ch_brand_detail,
              as: "brand",
              attributes: ["id", "name", "slug"],
            },
            {
              model: db.ch_color_detail,
              as: "color",
              attributes: ["id", "TITLE", "CODE"],
            },
            {
              model: db.processor,
              as: "processor",
              attributes: ["id", "name", "type"],
            },
          ],
        },
      ];
      if (result.maincat.length) {
        const ids = result.maincat[0].id;
        query.where.categoryId = {
          [Op.in]: [ids],
        };
        query.where.PubilshStatus = {
          [Op.eq]: "Published",
        };
        let product = await db.product.findAll({ ...query });
        if (product) {
          product.forEach((value) => {
            const brand = value.ProductVariants[0]
              ? value.ProductVariants[0].brand
              : null;
            const color = value.ProductVariants[0]
              ? value.ProductVariants[0].color
              : null;
            const processorList = value.ProductVariants[0]
              ? value.ProductVariants[0].processor
              : null;
            const networkList = value.ProductVariants[0]
              ? value.ProductVariants[0].networkType
              : null;
            const modelYearList = value.ProductVariants[0]
              ? value.ProductVariants[0].modelYear
              : null;
            const osTypeList = value.ProductVariants[0]
              ? value.ProductVariants[0].osType
              : null;
            const internalMemoryList = value.ProductVariants[0]
              ? value.ProductVariants[0].memory
              : null;
            const ramList = value.ProductVariants[0]
              ? value.ProductVariants[0].unitSize
              : null;
            const screenSizeList = value.ProductVariants[0]
              ? value.ProductVariants[0].screenSize
              : null;
            const batteryCapacityList = value.ProductVariants[0]
              ? value.ProductVariants[0].batteryCapacity
              : null;
            const primaryCameraList = value.ProductVariants[0]
              ? value.ProductVariants[0].primaryCamera
              : null;
            const secondaryCameraList = value.ProductVariants[0]
              ? value.ProductVariants[0].secondaryCamera
              : null;
            const simCountList = value.ProductVariants[0]
              ? value.ProductVariants[0].simCount
              : null;
            const interfaceList = value.ProductVariants[0]
              ? value.ProductVariants[0].interface
              : null;
            const compatibilityList = value.ProductVariants[0]
              ? value.ProductVariants[0].compatibility
              : null;
            BrandData.push(brand);
            ColorData.push(color);
            processorData.push(processorList);
            networkTypeData.push({ id: networkList });
            modelYearData.push({ id: modelYearList });
            osTypeData.push({ id: osTypeList });
            internalMemoryData.push({ id: internalMemoryList });
            ramData.push({ id: ramList });
            screenSizeData.push({ id: screenSizeList });
            batteryCapacityData.push({ id: batteryCapacityList });
            primaryCameraData.push({ id: primaryCameraList });
            secondaryCameraData.push({ id: secondaryCameraList });
            simCountData.push({ id: simCountList });
            interfaceData.push({ id: interfaceList });
            compatibilityData.push({ id: compatibilityList });
          });

          let checkEmptyColor = ColorData.filter(function (e) {
            return e != null;
          });
          let checkEmptyBrand = BrandData.filter(function (e) {
            return e != null;
          });
          let checkEmptyProcessor = processorData.filter(function (e) {
            return e != null;
          });
          let checkEmptyNetwork = checkEmpty(networkTypeData);
          let checkEmptyModelYear = checkEmpty(modelYearData);
          let checkEmptyOsType = checkEmpty(osTypeData);
          let checkEmptyInternalMemory = checkEmpty(internalMemoryData);
          let checkEmptyRam = checkEmpty(ramData);
          let checkEmptyScreenSize = checkEmpty(screenSizeData);
          let checkEmptyBatteryCapacity = checkEmpty(batteryCapacityData);
          let checkEmptyPrimary = checkEmpty(primaryCameraData);
          let checkEmptySecondary = checkEmpty(secondaryCameraData);
          let checkEmptySimcount = checkEmpty(simCountData);
          let checkEmptyInterface = checkEmpty(interfaceData);
          let checkEmptyCompatibility = checkEmpty(compatibilityData);
          const finalColor = checkEmptyColor.reduce((unique, o) => {
            if (!unique.some((obj) => obj.id === o.id)) {
              unique.push(o);
            }
            return unique;
          }, []);
          const finalBrand = checkEmptyBrand.reduce((unique, o) => {
            if (!unique.some((obj) => obj.id === o.id)) {
              unique.push(o);
            }
            return unique;
          }, []);
          const finalProcessor = checkEmptyProcessor.reduce((unique, o) => {
            if (!unique.some((obj) => obj.id === o.id)) {
              unique.push(o);
            }
            return unique;
          }, []);
          const finalNetwork = dummyList.network_type.filter(({ id: id1 }) =>
            uniqueArr(checkEmptyNetwork).some(({ id: id2 }) => id2 === id1)
          );
          const finalModelYear = dummyList.model_year.filter(({ id: id1 }) =>
            uniqueArr(checkEmptyModelYear).some(({ id: id2 }) => id2 === id1)
          );
          const finalOsType = dummyList.os_type.filter(({ id: id1 }) =>
            uniqueArr(checkEmptyOsType).some(({ id: id2 }) => id2 === id1)
          );
          const finalInternalMemory = dummyList.memory.filter(({ id: id1 }) =>
            uniqueArr(checkEmptyInternalMemory).some(
              ({ id: id2 }) => id2 === id1
            )
          );
          const finalRam = dummyList.Ram.filter(({ id: id1 }) =>
            uniqueArr(checkEmptyRam).some(({ id: id2 }) => id2 === id1)
          );
          const finalScreenSize = dummyList.screen_size.filter(({ id: id1 }) =>
            uniqueArr(checkEmptyScreenSize).some(({ id: id2 }) => id2 === id1)
          );
          const finalBatteryCapacity = dummyList.battery_capacity.filter(
            ({ id: id1 }) =>
              uniqueArr(checkEmptyBatteryCapacity).some(
                ({ id: id2 }) => id2 === id1
              )
          );

          const finalPrimary = dummyList.primary_camera.filter(({ id: id1 }) =>
            uniqueArr(checkEmptyPrimary).some(({ id: id2 }) => id2 === id1)
          );
          const finalSecondary = dummyList.secondary_camera.filter(
            ({ id: id1 }) =>
              uniqueArr(checkEmptySecondary).some(({ id: id2 }) => id2 === id1)
          );
          const finalSimCount = dummyList.sim_count.filter(({ id: id1 }) =>
            uniqueArr(checkEmptySimcount).some(({ id: id2 }) => id2 === id1)
          );
          const finalInterface = dummyList.interface.filter(({ id: id1 }) =>
            uniqueArr(checkEmptyInterface).some(({ id: id2 }) => id2 === id1)
          );
          const finalcompatibility = dummyList.compatibility.filter(
            ({ id: id1 }) =>
              uniqueArr(checkEmptyCompatibility).some(
                ({ id: id2 }) => id2 === id1
              )
          );
          const filters = [
            {
              type: "category",
              slug: "category",
              name: "Categories",
              checkVal: result.maincat.length,
              items: result.maincat,
            },
            {
              type: "check",
              slug: "brand",
              name: "Brand",
              checkVal: finalBrand.length,
              items: finalBrand,
            },
            {
              type: "color",
              slug: "color",
              checkVal: finalColor.length,
              name: "Color",
              items: finalColor,
            },
            {
              type: "check",
              slug: "networkType",
              name: "Network Type",
              checkVal: finalNetwork.length,
              items: finalNetwork,
            },
            {
              type: "check",
              slug: "modelYear",
              name: "Model year",
              checkVal: finalModelYear.length,
              items: finalModelYear,
            },
            {
              type: "check",
              slug: "os_type",
              name: "Operating System",
              checkVal: finalOsType.length,
              items: finalOsType,
            },
            {
              type: "check",
              slug: "memory",
              name: "Internal Memory",
              checkVal: finalInternalMemory.length,
              items: finalInternalMemory,
            },
            {
              type: "check",
              slug: "ram",
              name: "Ram",
              checkVal: finalRam.length,
              items: finalRam,
            },
            {
              type: "check",
              slug: "screen_size",
              name: "Screen Size",
              checkVal: finalScreenSize.length,
              items: finalScreenSize,
            },
            {
              type: "check",
              slug: "battery_capacity",
              name: "Battery Capacity",
              checkVal: finalBatteryCapacity.length,
              items: finalBatteryCapacity,
            },
            {
              type: "check",
              slug: "primary_camera",
              name: "Primary Camera",
              checkVal: finalPrimary.length,
              items: finalPrimary,
            },
            {
              type: "check",
              slug: "secondary_camera",
              name: "Secondary Camera",
              checkVal: finalSecondary.length,
              items: finalSecondary,
            },
            {
              type: "check",
              slug: "sim_count",
              name: "SIM Count",
              checkVal: finalSimCount.length,
              items: finalSimCount,
            },
            {
              type: "check",
              slug: "interface",
              name: "Interface",
              checkVal: finalInterface.length,
              items: finalInterface,
            },
            {
              type: "check",
              slug: "compatibility",
              name: "Charger Compatibility",
              checkVal: finalcompatibility.length,
              items: finalcompatibility,
            },
            {
              type: "check",
              slug: "processor",
              name: "Processor",
              checkVal: finalProcessor.length,
              items: finalProcessor,
            },
            {
              type: "range",
              slug: "price",
              name: "Price",
              min: 0,
              max: 100000,
              value: [0, 100000],
            },
          ];
          let response = Util.getFormatedResponse(false, filters, {
            message: "Success",
          });
          res.status(response.code).json(response);
        }
      } else if (result.subcat.length) {
        const ids = result.subcat[0].id;
        query.where.subcategoryId = {
          [Op.in]: [ids],
        };
        query.where.PubilshStatus = {
          [Op.eq]: "Published",
        };
        let product = await db.product.findAll({ ...query });
        if (product) {
          product.forEach((value) => {
            const brand = value.ProductVariants[0]
              ? value.ProductVariants[0].brand
              : null;
            const color = value.ProductVariants[0]
              ? value.ProductVariants[0].color
              : null;
            const processorList = value.ProductVariants[0]
              ? value.ProductVariants[0].processor
              : null;
            const networkList = value.ProductVariants[0]
              ? value.ProductVariants[0].networkType
              : null;
            const modelYearList = value.ProductVariants[0]
              ? value.ProductVariants[0].modelYear
              : null;
            const osTypeList = value.ProductVariants[0]
              ? value.ProductVariants[0].osType
              : null;
            const internalMemoryList = value.ProductVariants[0]
              ? value.ProductVariants[0].memory
              : null;
            const ramList = value.ProductVariants[0]
              ? value.ProductVariants[0].unitSize
              : null;
            const screenSizeList = value.ProductVariants[0]
              ? value.ProductVariants[0].screenSize
              : null;
            const batteryCapacityList = value.ProductVariants[0]
              ? value.ProductVariants[0].batteryCapacity
              : null;
            const primaryCameraList = value.ProductVariants[0]
              ? value.ProductVariants[0].primaryCamera
              : null;
            const secondaryCameraList = value.ProductVariants[0]
              ? value.ProductVariants[0].secondaryCamera
              : null;
            const simCountList = value.ProductVariants[0]
              ? value.ProductVariants[0].simCount
              : null;
            const interfaceList = value.ProductVariants[0]
              ? value.ProductVariants[0].interface
              : null;
            const compatibilityList = value.ProductVariants[0]
              ? value.ProductVariants[0].compatibility
              : null;
            BrandData.push(brand);
            ColorData.push(color);
            processorData.push(processorList);
            processorData.push(processorList);
            networkTypeData.push({ id: networkList });
            modelYearData.push({ id: modelYearList });
            osTypeData.push({ id: osTypeList });
            internalMemoryData.push({ id: internalMemoryList });
            ramData.push({ id: ramList });
            screenSizeData.push({ id: screenSizeList });
            batteryCapacityData.push({ id: batteryCapacityList });
            primaryCameraData.push({ id: primaryCameraList });
            secondaryCameraData.push({ id: secondaryCameraList });
            simCountData.push({ id: simCountList });
            interfaceData.push({ id: interfaceList });
            compatibilityData.push({ id: compatibilityList });
          });

          let checkEmptyColor = ColorData.filter(function (e) {
            return e != null;
          });
          let checkEmptyBrand = BrandData.filter(function (e) {
            return e != null;
          });
          let checkEmptyProcessor = processorData.filter(function (e) {
            return e != null;
          });
          let checkEmptyNetwork = checkEmpty(networkTypeData);
          let checkEmptyModelYear = checkEmpty(modelYearData);
          let checkEmptyOsType = checkEmpty(osTypeData);
          let checkEmptyInternalMemory = checkEmpty(internalMemoryData);
          let checkEmptyRam = checkEmpty(ramData);
          let checkEmptyScreenSize = checkEmpty(screenSizeData);
          let checkEmptyBatteryCapacity = checkEmpty(batteryCapacityData);
          let checkEmptyPrimary = checkEmpty(primaryCameraData);
          let checkEmptySecondary = checkEmpty(secondaryCameraData);
          let checkEmptySimcount = checkEmpty(simCountData);
          let checkEmptyInterface = checkEmpty(interfaceData);
          let checkEmptyCompatibility = checkEmpty(compatibilityData);
          const finalColor = checkEmptyColor.reduce((unique, o) => {
            if (!unique.some((obj) => obj.id === o.id)) {
              unique.push(o);
            }
            return unique;
          }, []);
          const finalBrand = checkEmptyBrand.reduce((unique, o) => {
            if (!unique.some((obj) => obj.id === o.id)) {
              unique.push(o);
            }
            return unique;
          }, []);
          const finalProcessor = checkEmptyProcessor.reduce((unique, o) => {
            if (!unique.some((obj) => obj.id === o.id)) {
              unique.push(o);
            }
            return unique;
          }, []);
          const finalNetwork = dummyList.network_type.filter(({ id: id1 }) =>
            uniqueArr(checkEmptyNetwork).some(({ id: id2 }) => id2 === id1)
          );
          const finalModelYear = dummyList.model_year.filter(({ id: id1 }) =>
            uniqueArr(checkEmptyModelYear).some(({ id: id2 }) => id2 === id1)
          );
          const finalOsType = dummyList.os_type.filter(({ id: id1 }) =>
            uniqueArr(checkEmptyOsType).some(({ id: id2 }) => id2 === id1)
          );
          const finalInternalMemory = dummyList.memory.filter(({ id: id1 }) =>
            uniqueArr(checkEmptyInternalMemory).some(
              ({ id: id2 }) => id2 === id1
            )
          );
          const finalRam = dummyList.Ram.filter(({ id: id1 }) =>
            uniqueArr(checkEmptyRam).some(({ id: id2 }) => id2 === id1)
          );
          const finalScreenSize = dummyList.screen_size.filter(({ id: id1 }) =>
            uniqueArr(checkEmptyScreenSize).some(({ id: id2 }) => id2 === id1)
          );
          const finalBatteryCapacity = dummyList.battery_capacity.filter(
            ({ id: id1 }) =>
              uniqueArr(checkEmptyBatteryCapacity).some(
                ({ id: id2 }) => id2 === id1
              )
          );

          const finalPrimary = dummyList.primary_camera.filter(({ id: id1 }) =>
            uniqueArr(checkEmptyPrimary).some(({ id: id2 }) => id2 === id1)
          );
          const finalSecondary = dummyList.secondary_camera.filter(
            ({ id: id1 }) =>
              uniqueArr(checkEmptySecondary).some(({ id: id2 }) => id2 === id1)
          );
          const finalSimCount = dummyList.sim_count.filter(({ id: id1 }) =>
            uniqueArr(checkEmptySimcount).some(({ id: id2 }) => id2 === id1)
          );
          const finalInterface = dummyList.interface.filter(({ id: id1 }) =>
            uniqueArr(checkEmptyInterface).some(({ id: id2 }) => id2 === id1)
          );
          const finalcompatibility = dummyList.compatibility.filter(
            ({ id: id1 }) =>
              uniqueArr(checkEmptyCompatibility).some(
                ({ id: id2 }) => id2 === id1
              )
          );
          const filters = [
            {
              type: "category",
              slug: "category",
              name: "Categories",
              checkVal: result.maincat.length,
              items: result.maincat,
            },
            {
              type: "check",
              slug: "brand",
              name: "Brand",
              checkVal: finalBrand.length,
              items: finalBrand,
            },
            {
              type: "color",
              slug: "color",
              checkVal: finalColor.length,
              name: "Color",
              items: finalColor,
            },
            {
              type: "check",
              slug: "networkType",
              name: "Network Type",
              checkVal: finalNetwork.length,
              items: finalNetwork,
            },
            {
              type: "check",
              slug: "modelYear",
              name: "Model year",
              checkVal: finalModelYear.length,
              items: finalModelYear,
            },
            {
              type: "check",
              slug: "os_type",
              name: "Operating System",
              checkVal: finalOsType.length,
              items: finalOsType,
            },
            {
              type: "check",
              slug: "memory",
              name: "Internal Memory",
              checkVal: finalInternalMemory.length,
              items: finalInternalMemory,
            },
            {
              type: "check",
              slug: "ram",
              name: "Ram",
              checkVal: finalRam.length,
              items: finalRam,
            },
            {
              type: "check",
              slug: "screen_size",
              name: "Screen Size",
              checkVal: finalScreenSize.length,
              items: finalScreenSize,
            },
            {
              type: "check",
              slug: "battery_capacity",
              name: "Battery Capacity",
              checkVal: finalBatteryCapacity.length,
              items: finalBatteryCapacity,
            },
            {
              type: "check",
              slug: "primary_camera",
              name: "Primary Camera",
              checkVal: finalPrimary.length,
              items: finalPrimary,
            },
            {
              type: "check",
              slug: "secondary_camera",
              name: "Secondary Camera",
              checkVal: finalSecondary.length,
              items: finalSecondary,
            },
            {
              type: "check",
              slug: "sim_count",
              name: "SIM Count",
              checkVal: finalSimCount.length,
              items: finalSimCount,
            },
            {
              type: "check",
              slug: "interface",
              name: "Interface",
              checkVal: finalInterface.length,
              items: finalInterface,
            },
            {
              type: "check",
              slug: "compatibility",
              name: "Charger Compatibility",
              checkVal: finalcompatibility.length,
              items: finalcompatibility,
            },
            {
              type: "check",
              slug: "processor",
              name: "Processor",
              checkVal: finalProcessor.length,
              items: finalProcessor,
            },
            {
              type: "range",
              slug: "price",
              name: "Price",
              min: 0,
              max: 100000,
              value: [0, 100000],
            },
          ];
          let response = Util.getFormatedResponse(false, filters, {
            message: "Success",
          });
          res.status(response.code).json(response);
        }
      } else if (result.subchild.length) {
        const ids = result.subchild[0].id;
        query.where.childCategoryId = {
          [Op.in]: [ids],
        };
        query.where.PubilshStatus = {
          [Op.eq]: "Published",
        };
        let product = await db.product.findAll({ ...query });
        if (product) {
          product.forEach((value) => {
            const brand = value.ProductVariants[0]
              ? value.ProductVariants[0].brand
              : null;
            const color = value.ProductVariants[0]
              ? value.ProductVariants[0].color
              : null;
            const processorList = value.ProductVariants[0]
              ? value.ProductVariants[0].processor
              : null;
            const networkList = value.ProductVariants[0]
              ? value.ProductVariants[0].networkType
              : null;
            const modelYearList = value.ProductVariants[0]
              ? value.ProductVariants[0].modelYear
              : null;
            const osTypeList = value.ProductVariants[0]
              ? value.ProductVariants[0].osType
              : null;
            const internalMemoryList = value.ProductVariants[0]
              ? value.ProductVariants[0].memory
              : null;
            const ramList = value.ProductVariants[0]
              ? value.ProductVariants[0].unitSize
              : null;
            const screenSizeList = value.ProductVariants[0]
              ? value.ProductVariants[0].screenSize
              : null;
            const batteryCapacityList = value.ProductVariants[0]
              ? value.ProductVariants[0].batteryCapacity
              : null;
            const primaryCameraList = value.ProductVariants[0]
              ? value.ProductVariants[0].primaryCamera
              : null;
            const secondaryCameraList = value.ProductVariants[0]
              ? value.ProductVariants[0].secondaryCamera
              : null;
            const simCountList = value.ProductVariants[0]
              ? value.ProductVariants[0].simCount
              : null;
            const interfaceList = value.ProductVariants[0]
              ? value.ProductVariants[0].interface
              : null;
            const compatibilityList = value.ProductVariants[0]
              ? value.ProductVariants[0].compatibility
              : null;
            BrandData.push(brand);
            ColorData.push(color);
            processorData.push(processorList);
            networkTypeData.push({ id: networkList });
            modelYearData.push({ id: modelYearList });
            osTypeData.push({ id: osTypeList });
            internalMemoryData.push({ id: internalMemoryList });
            ramData.push({ id: ramList });
            screenSizeData.push({ id: screenSizeList });
            batteryCapacityData.push({ id: batteryCapacityList });
            primaryCameraData.push({ id: primaryCameraList });
            secondaryCameraData.push({ id: secondaryCameraList });
            simCountData.push({ id: simCountList });
            interfaceData.push({ id: interfaceList });
            compatibilityData.push({ id: compatibilityList });
          });

          let checkEmptyColor = ColorData.filter(function (e) {
            return e != null;
          });
          let checkEmptyBrand = BrandData.filter(function (e) {
            return e != null;
          });
          let checkEmptyProcessor = processorData.filter(function (e) {
            return e != null;
          });
          let checkEmptyNetwork = checkEmpty(networkTypeData);
          let checkEmptyModelYear = checkEmpty(modelYearData);
          let checkEmptyOsType = checkEmpty(osTypeData);
          let checkEmptyInternalMemory = checkEmpty(internalMemoryData);
          let checkEmptyRam = checkEmpty(ramData);
          let checkEmptyScreenSize = checkEmpty(screenSizeData);
          let checkEmptyBatteryCapacity = checkEmpty(batteryCapacityData);
          let checkEmptyPrimary = checkEmpty(primaryCameraData);
          let checkEmptySecondary = checkEmpty(secondaryCameraData);
          let checkEmptySimcount = checkEmpty(simCountData);
          let checkEmptyInterface = checkEmpty(interfaceData);
          let checkEmptyCompatibility = checkEmpty(compatibilityData);
          const finalColor = checkEmptyColor.reduce((unique, o) => {
            if (!unique.some((obj) => obj.id === o.id)) {
              unique.push(o);
            }
            return unique;
          }, []);
          const finalBrand = checkEmptyBrand.reduce((unique, o) => {
            if (!unique.some((obj) => obj.id === o.id)) {
              unique.push(o);
            }
            return unique;
          }, []);
          const finalProcessor = checkEmptyProcessor.reduce((unique, o) => {
            if (!unique.some((obj) => obj.id === o.id)) {
              unique.push(o);
            }
            return unique;
          }, []);
          const finalNetwork = dummyList.network_type.filter(({ id: id1 }) =>
            uniqueArr(checkEmptyNetwork).some(({ id: id2 }) => id2 === id1)
          );
          const finalModelYear = dummyList.model_year.filter(({ id: id1 }) =>
            uniqueArr(checkEmptyModelYear).some(({ id: id2 }) => id2 === id1)
          );
          const finalOsType = dummyList.os_type.filter(({ id: id1 }) =>
            uniqueArr(checkEmptyOsType).some(({ id: id2 }) => id2 === id1)
          );
          const finalInternalMemory = dummyList.memory.filter(({ id: id1 }) =>
            uniqueArr(checkEmptyInternalMemory).some(
              ({ id: id2 }) => id2 === id1
            )
          );
          const finalRam = dummyList.Ram.filter(({ id: id1 }) =>
            uniqueArr(checkEmptyRam).some(({ id: id2 }) => id2 === id1)
          );
          const finalScreenSize = dummyList.screen_size.filter(({ id: id1 }) =>
            uniqueArr(checkEmptyScreenSize).some(({ id: id2 }) => id2 === id1)
          );
          const finalBatteryCapacity = dummyList.battery_capacity.filter(
            ({ id: id1 }) =>
              uniqueArr(checkEmptyBatteryCapacity).some(
                ({ id: id2 }) => id2 === id1
              )
          );

          const finalPrimary = dummyList.primary_camera.filter(({ id: id1 }) =>
            uniqueArr(checkEmptyPrimary).some(({ id: id2 }) => id2 === id1)
          );
          const finalSecondary = dummyList.secondary_camera.filter(
            ({ id: id1 }) =>
              uniqueArr(checkEmptySecondary).some(({ id: id2 }) => id2 === id1)
          );
          const finalSimCount = dummyList.sim_count.filter(({ id: id1 }) =>
            uniqueArr(checkEmptySimcount).some(({ id: id2 }) => id2 === id1)
          );
          const finalInterface = dummyList.interface.filter(({ id: id1 }) =>
            uniqueArr(checkEmptyInterface).some(({ id: id2 }) => id2 === id1)
          );
          const finalcompatibility = dummyList.compatibility.filter(
            ({ id: id1 }) =>
              uniqueArr(checkEmptyCompatibility).some(
                ({ id: id2 }) => id2 === id1
              )
          );
          const filters = [
            {
              type: "category",
              slug: "category",
              name: "Categories",
              checkVal: result.maincat.length,
              items: result.maincat,
            },
            {
              type: "check",
              slug: "brand",
              name: "Brand",
              checkVal: finalBrand.length,
              items: finalBrand,
            },
            {
              type: "color",
              slug: "color",
              checkVal: finalColor.length,
              name: "Color",
              items: finalColor,
            },
            {
              type: "check",
              slug: "networkType",
              name: "Network Type",
              checkVal: finalNetwork.length,
              items: finalNetwork,
            },
            {
              type: "check",
              slug: "modelYear",
              name: "Model year",
              checkVal: finalModelYear.length,
              items: finalModelYear,
            },
            {
              type: "check",
              slug: "os_type",
              name: "Operating System",
              checkVal: finalOsType.length,
              items: finalOsType,
            },
            {
              type: "check",
              slug: "memory",
              name: "Internal Memory",
              checkVal: finalInternalMemory.length,
              items: finalInternalMemory,
            },
            {
              type: "check",
              slug: "ram",
              name: "Ram",
              checkVal: finalRam.length,
              items: finalRam,
            },
            {
              type: "check",
              slug: "screen_size",
              name: "Screen Size",
              checkVal: finalScreenSize.length,
              items: finalScreenSize,
            },
            {
              type: "check",
              slug: "battery_capacity",
              name: "Battery Capacity",
              checkVal: finalBatteryCapacity.length,
              items: finalBatteryCapacity,
            },
            {
              type: "check",
              slug: "primary_camera",
              name: "Primary Camera",
              checkVal: finalPrimary.length,
              items: finalPrimary,
            },
            {
              type: "check",
              slug: "secondary_camera",
              name: "Secondary Camera",
              checkVal: finalSecondary.length,
              items: finalSecondary,
            },
            {
              type: "check",
              slug: "sim_count",
              name: "SIM Count",
              checkVal: finalSimCount.length,
              items: finalSimCount,
            },
            {
              type: "check",
              slug: "interface",
              name: "Interface",
              checkVal: finalInterface.length,
              items: finalInterface,
            },
            {
              type: "check",
              slug: "compatibility",
              name: "Charger Compatibility",
              checkVal: finalcompatibility.length,
              items: finalcompatibility,
            },
            {
              type: "check",
              slug: "processor",
              name: "Processor",
              checkVal: finalProcessor.length,
              items: finalProcessor,
            },
            {
              type: "range",
              slug: "price",
              name: "Price",
              min: 0,
              max: 100000,
              value: [0, 100000],
            },
          ];
          let response = Util.getFormatedResponse(false, filters, {
            message: "Success",
          });
          res.status(response.code).json(response);
        }
      } else if (result.brand.length) {
        const ids = result.brand[0].id;
        let product = await db.ProductVariant.findAll({
          where: {
            brandId: { [Op.in]: [ids] },
          },
          include: [
            {
              model: db.ch_brand_detail,
              as: "brand",
              attributes: ["id", "name", "slug"],
            },
            {
              model: db.ch_color_detail,
              as: "color",
              attributes: ["id", "TITLE", "CODE"],
            },
            {
              model: db.processor,
              as: "processor",
              attributes: ["id", "name", "type"],
            },
          ],
        });
        if (product) {
          product.forEach((value) => {
            const brand = value.ProductVariants[0]
              ? value.ProductVariants[0].brand
              : null;
            const color = value.ProductVariants[0]
              ? value.ProductVariants[0].color
              : null;
            const processorList = value.ProductVariants[0]
              ? value.ProductVariants[0].processor
              : null;
            const networkList = value.ProductVariants[0]
              ? value.ProductVariants[0].networkType
              : null;
            const modelYearList = value.ProductVariants[0]
              ? value.ProductVariants[0].modelYear
              : null;
            const osTypeList = value.ProductVariants[0]
              ? value.ProductVariants[0].osType
              : null;
            const internalMemoryList = value.ProductVariants[0]
              ? value.ProductVariants[0].memory
              : null;
            const ramList = value.ProductVariants[0]
              ? value.ProductVariants[0].unitSize
              : null;
            const screenSizeList = value.ProductVariants[0]
              ? value.ProductVariants[0].screenSize
              : null;
            const batteryCapacityList = value.ProductVariants[0]
              ? value.ProductVariants[0].batteryCapacity
              : null;
            const primaryCameraList = value.ProductVariants[0]
              ? value.ProductVariants[0].primaryCamera
              : null;
            const secondaryCameraList = value.ProductVariants[0]
              ? value.ProductVariants[0].secondaryCamera
              : null;
            const simCountList = value.ProductVariants[0]
              ? value.ProductVariants[0].simCount
              : null;
            const interfaceList = value.ProductVariants[0]
              ? value.ProductVariants[0].interface
              : null;
            const compatibilityList = value.ProductVariants[0]
              ? value.ProductVariants[0].compatibility
              : null;
            BrandData.push(brand);
            ColorData.push(color);
            processorData.push(processorList);
            networkTypeData.push({ id: networkList });
            modelYearData.push({ id: modelYearList });
            osTypeData.push({ id: osTypeList });
            internalMemoryData.push({ id: internalMemoryList });
            ramData.push({ id: ramList });
            screenSizeData.push({ id: screenSizeList });
            batteryCapacityData.push({ id: batteryCapacityList });
            primaryCameraData.push({ id: primaryCameraList });
            secondaryCameraData.push({ id: secondaryCameraList });
            simCountData.push({ id: simCountList });
            interfaceData.push({ id: interfaceList });
            compatibilityData.push({ id: compatibilityList });
          });

          let checkEmptyColor = ColorData.filter(function (e) {
            return e != null;
          });
          let checkEmptyBrand = BrandData.filter(function (e) {
            return e != null;
          });
          let checkEmptyProcessor = processorData.filter(function (e) {
            return e != null;
          });
          let checkEmptyNetwork = checkEmpty(networkTypeData);
          let checkEmptyModelYear = checkEmpty(modelYearData);
          let checkEmptyOsType = checkEmpty(osTypeData);
          let checkEmptyInternalMemory = checkEmpty(internalMemoryData);
          let checkEmptyRam = checkEmpty(ramData);
          let checkEmptyScreenSize = checkEmpty(screenSizeData);
          let checkEmptyBatteryCapacity = checkEmpty(batteryCapacityData);
          let checkEmptyPrimary = checkEmpty(primaryCameraData);
          let checkEmptySecondary = checkEmpty(secondaryCameraData);
          let checkEmptySimcount = checkEmpty(simCountData);
          let checkEmptyInterface = checkEmpty(interfaceData);
          let checkEmptyCompatibility = checkEmpty(compatibilityData);
          const finalColor = checkEmptyColor.reduce((unique, o) => {
            if (!unique.some((obj) => obj.id === o.id)) {
              unique.push(o);
            }
            return unique;
          }, []);
          const finalBrand = checkEmptyBrand.reduce((unique, o) => {
            if (!unique.some((obj) => obj.id === o.id)) {
              unique.push(o);
            }
            return unique;
          }, []);
          const finalProcessor = checkEmptyProcessor.reduce((unique, o) => {
            if (!unique.some((obj) => obj.id === o.id)) {
              unique.push(o);
            }
            return unique;
          }, []);
          const finalNetwork = dummyList.network_type.filter(({ id: id1 }) =>
            uniqueArr(checkEmptyNetwork).some(({ id: id2 }) => id2 === id1)
          );
          const finalModelYear = dummyList.model_year.filter(({ id: id1 }) =>
            uniqueArr(checkEmptyModelYear).some(({ id: id2 }) => id2 === id1)
          );
          const finalOsType = dummyList.os_type.filter(({ id: id1 }) =>
            uniqueArr(checkEmptyOsType).some(({ id: id2 }) => id2 === id1)
          );
          const finalInternalMemory = dummyList.memory.filter(({ id: id1 }) =>
            uniqueArr(checkEmptyInternalMemory).some(
              ({ id: id2 }) => id2 === id1
            )
          );
          const finalRam = dummyList.Ram.filter(({ id: id1 }) =>
            uniqueArr(checkEmptyRam).some(({ id: id2 }) => id2 === id1)
          );
          const finalScreenSize = dummyList.screen_size.filter(({ id: id1 }) =>
            uniqueArr(checkEmptyScreenSize).some(({ id: id2 }) => id2 === id1)
          );
          const finalBatteryCapacity = dummyList.battery_capacity.filter(
            ({ id: id1 }) =>
              uniqueArr(checkEmptyBatteryCapacity).some(
                ({ id: id2 }) => id2 === id1
              )
          );

          const finalPrimary = dummyList.primary_camera.filter(({ id: id1 }) =>
            uniqueArr(checkEmptyPrimary).some(({ id: id2 }) => id2 === id1)
          );
          const finalSecondary = dummyList.secondary_camera.filter(
            ({ id: id1 }) =>
              uniqueArr(checkEmptySecondary).some(({ id: id2 }) => id2 === id1)
          );
          const finalSimCount = dummyList.sim_count.filter(({ id: id1 }) =>
            uniqueArr(checkEmptySimcount).some(({ id: id2 }) => id2 === id1)
          );
          const finalInterface = dummyList.interface.filter(({ id: id1 }) =>
            uniqueArr(checkEmptyInterface).some(({ id: id2 }) => id2 === id1)
          );
          const finalcompatibility = dummyList.compatibility.filter(
            ({ id: id1 }) =>
              uniqueArr(checkEmptyCompatibility).some(
                ({ id: id2 }) => id2 === id1
              )
          );
          const filters = [
            {
              type: "category",
              slug: "category",
              name: "Categories",
              checkVal: result.maincat.length,
              items: result.maincat,
            },
            {
              type: "check",
              slug: "brand",
              name: "Brand",
              checkVal: finalBrand.length,
              items: finalBrand,
            },
            {
              type: "color",
              slug: "color",
              checkVal: finalColor.length,
              name: "Color",
              items: finalColor,
            },
            {
              type: "check",
              slug: "networkType",
              name: "Network Type",
              checkVal: finalNetwork.length,
              items: finalNetwork,
            },
            {
              type: "check",
              slug: "modelYear",
              name: "Model year",
              checkVal: finalModelYear.length,
              items: finalModelYear,
            },
            {
              type: "check",
              slug: "os_type",
              name: "Operating System",
              checkVal: finalOsType.length,
              items: finalOsType,
            },
            {
              type: "check",
              slug: "memory",
              name: "Internal Memory",
              checkVal: finalInternalMemory.length,
              items: finalInternalMemory,
            },
            {
              type: "check",
              slug: "ram",
              name: "Ram",
              checkVal: finalRam.length,
              items: finalRam,
            },
            {
              type: "check",
              slug: "screen_size",
              name: "Screen Size",
              checkVal: finalScreenSize.length,
              items: finalScreenSize,
            },
            {
              type: "check",
              slug: "battery_capacity",
              name: "Battery Capacity",
              checkVal: finalBatteryCapacity.length,
              items: finalBatteryCapacity,
            },
            {
              type: "check",
              slug: "primary_camera",
              name: "Primary Camera",
              checkVal: finalPrimary.length,
              items: finalPrimary,
            },
            {
              type: "check",
              slug: "secondary_camera",
              name: "Secondary Camera",
              checkVal: finalSecondary.length,
              items: finalSecondary,
            },
            {
              type: "check",
              slug: "sim_count",
              name: "SIM Count",
              checkVal: finalSimCount.length,
              items: finalSimCount,
            },
            {
              type: "check",
              slug: "interface",
              name: "Interface",
              checkVal: finalInterface.length,
              items: finalInterface,
            },
            {
              type: "check",
              slug: "compatibility",
              name: "Charger Compatibility",
              checkVal: finalcompatibility.length,
              items: finalcompatibility,
            },
            {
              type: "check",
              slug: "processor",
              name: "Processor",
              checkVal: finalProcessor.length,
              items: finalProcessor,
            },
            {
              type: "range",
              slug: "price",
              name: "Price",
              min: 0,
              max: 100000,
              value: [0, 100000],
            },
          ];
          let response = Util.getFormatedResponse(false, filters, {
            message: "Success",
          });
          res.status(response.code).json(response);
        }
      } else {
        let response = Util.getFormatedResponse(false, {
          message: "No data found",
        });
        res.status(response.code).json(response);
      }
    } catch (err) {
      throw new RequestError(err);
    }
  },
  async getAutoSuggestList(req, res, next) {
    let { query } = req.query;
    let search = "%";
    if (query) {
      search = query + "%";
    }
    try {
      let result = {};
      result.tag = await db.tag.findAll({
        attributes: [
          [Sequelize.fn("DISTINCT", Sequelize.col("title")), "title"],
        ],
        where: { title: { [Op.like]: search } },
      });
      result.maincat = await db.category.findAll({
        where: { name: { [Op.like]: search }, status: "1" },
      });
      result.subcat = await db.SubCategory.findAll({
        where: { sub_name: { [Op.like]: search } },
      });
      result.subchild = await db.SubChildCategory.findAll({
        where: { name: { [Op.like]: search } },
      });
      result.brand = await db.ch_brand_detail.findAll({
        where: { name: { [Op.like]: search }, status: true },
      });
      result.varient = await db.ProductVariant.findAll({
        where: { productName: { [Op.like]: search } },
        include: [
          {
            model: db.product,
            attributes: ["id"],
            where: {
              SellerId: { [Op.ne]: null },
              PubilshStatus: { [Op.eq]: "Published" },
            },
          },
        ],
      });
      var newList = [];
      if (
        (result.tag && result.tag.length) ||
        (result.maincat && result.maincat.length) ||
        (result.subcat && result.subcat.length) ||
        (result.subchild && result.subchild.length) ||
        (result.brand && result.brand.length) ||
        result.varient
      ) {
        for (let i = 0; i < result.tag.length; i++) {
          const assignee = result.tag[i];
          let assigneeData = {
            id: assignee.id,
            name: assignee.title,
            slug: assignee.title,
          };
          newList.push(assigneeData);
        }
        for (let i = 0; i < result.maincat.length; i++) {
          const assignee = result.maincat[i];
          let assigneeData = {
            id: assignee.id,
            name: assignee.name,
            slug: assignee.slug,
            thumbnail: assignee.thumbnail,
          };
          newList.push(assigneeData);
        }
        for (let i = 0; i < result.subcat.length; i++) {
          const assignee = result.subcat[i];
          let assigneeData = {
            id: assignee.id,
            name: assignee.sub_name,
            slug: assignee.slug,
          };
          newList.push(assigneeData);
        }
        for (let i = 0; i < result.subchild.length; i++) {
          const assignee = result.subchild[i];
          let assigneeData = {
            id: assignee.id,
            name: assignee.name,
            slug: assignee.slug,
          };
          newList.push(assigneeData);
        }
        for (let i = 0; i < result.brand.length; i++) {
          const assignee = result.brand[i];
          let assigneeData = {
            id: assignee.id,
            name: assignee.name,
            slug: assignee.slug,
          };
          newList.push(assigneeData);
        }
        for (let i = 0; i < result.varient.length; i++) {
          const assignee = result.varient[i];
          let assigneeData = {
            id: assignee.id,
            name: assignee.productName,
            slug: assignee.slug,
            thumbnail: assignee.thumbnail,
          };
          newList.push(assigneeData);
        }
        var response = Util.getFormatedResponse(false, newList, {
          message: "Success",
        });
        res.status(response.code).json(response);
      } else {
        let response = Util.getFormatedResponse(true, {
          message: "No data found",
        });
        res.status(response.code).json(response);
      }
    } catch (err) {
      console.log(err);
      throw new RequestError(err);
    }
  },
  async relatedProduct(req, res, next) {
    const { productId, slug } = req.query;
    const limit = 50;
    const query = {};
    query.where = {};

    query.limit = limit;
    query.order = [["id", "DESC"]];
    query.attributes = [
      "id",
      "name",
      "slug",
      "SellerId",
      "PubilshStatus",
      "categoryId",
      "subCategoryId",
      "childCategoryId",
    ];
    query.include = [
      {
        model: db.ProductVariant,
        attributes: [
          "id",
          "productName",
          "qty",
          "thumbnail",
          "distributorPrice",
          "netPrice",
          "discount",
          "discountPer",
        ],
        include: [{ model: db.productphoto, attributes: ["id", "imgUrl"] }],
      },
    ];
    query.where.SellerId = {
      [Op.ne]: null,
    };
    query.where.PubilshStatus = {
      [Op.eq]: "Published",
    };
    try {
      const product = await db.product.findOne({
        where: {
          id: productId,
          slug: slug,
          SellerId: { [Op.ne]: null },
          PubilshStatus: { [Op.eq]: "Published" },
        },
      });
      const varient = await db.ProductVariant.findOne({
        attributes: ["id", "productId"],
        where: {
          id: productId,
          slug: slug,
        },
        include: [
          {
            model: db.product,
            attributes: ["id", "childCategoryId"],
            where: { PubilshStatus: { [Op.eq]: "Published" } },
          },
        ],
      });
      if (product && product.id) {
        query.where.childCategoryId = product.childCategoryId;
        const finalResult = await db.product.findAll(query);
        if (finalResult.length) {
          const arrData = [];
          finalResult.forEach((value) => {
            const dataList = {
              ProductId: value.id,
              VarientId: value.ProductVariants[0]
                ? value.ProductVariants[0].id
                : null,
              Name: value.name,
              slug: value.slug,
              qty: value.ProductVariants[0]
                ? value.ProductVariants[0].qty
                : null,
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
              HighLightDetail: value.HighLightDetail,
            };
            arrData.push(dataList);
          });
          let response = Util.getFormatedResponse(false, arrData, {
            message: "Success",
          });
          res.status(response.code).json(response);
        }
      } else if (varient && varient.product) {
        query.where.childCategoryId = varient.product.childCategoryId;
        const finalResult = await db.product.findAll(query);
        if (finalResult.length) {
          const arrData = [];
          finalResult.forEach((value) => {
            const dataList = {
              ProductId: value.id,
              name: value.name,
              slug: value.slug,
              qty: value.ProductVariants[0]
                ? value.ProductVariants[0].qty
                : null,
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
              HighLightDetail: value.HighLightDetail,
            };
            arrData.push(dataList);
          });
          let response = Util.getFormatedResponse(false, arrData, {
            message: "Success",
          });
          res.status(response.code).json(response);
        }
      } else {
        var response = Util.getFormatedResponse(false, {
          message: "No data found",
        });
        res.status(response.code).json(response);
      }
    } catch (err) {
      throw new RequestError(err);
    }
  },
  async getPopularCategory(req, res, next) {
    try {
      await db.category.findAll().then((list) => {
        let response = Util.getFormatedResponse(false, list, {
          message: "Success",
        });
        res.status(response.code).json(response);
      });
    } catch (err) {
      throw new RequestError(err);
    }
  },
  async createAddress(req, res, next) {
    try {
      const { fullName, phone, zoneName, city, shippingAddress } = req.body;
      db.customer
        .findOne({
          where: {
            id: req.user.id,
            email: req.user.email,
            role: req.user.role,
          },
        })
        .then((customer) => {
          if (customer) {
            return db.Address.create({
              custId: req.user.id,
              fullname: fullName,
              phone: phone,
              city: city,
              states: zoneName,
              shipping: shippingAddress,
            });
          } else {
            var response = Util.getFormatedResponse(false, {
              message: "No found data",
            });
            res.status(response.code).json(response);
          }
        })
        .then((re) => {
          var response = Util.getFormatedResponse(false, {
            message: "Success",
          });
          res.status(response.code).json(response);
        })
        .catch((err) => {
          var response = Util.getFormatedResponse(false, {
            message: err,
          });
          res.status(response.code).json(response);
        });
    } catch (err) {
      var response = Util.getFormatedResponse(false, {
        message: err,
      });
      res.status(response.code).json(response);
    }
  },
  async createOrder(req, res, next) {
    try {
      const { payment, addressId, total, cart } = req.body;
      const query = {};
      query.where = {};
      db.customer
        .findOne({ where: { id: req.user.id, email: req.user.email } })
        .then(async (customer) => {
          const t = await db.sequelize.transaction();
          let orderId =
            "OD" +
            Math.floor(Math.random() * Math.floor(Math.random() * Date.now()));
          if (customer) {
            try {
              const order = await db.Order.create(
                {
                  addressId: addressId,
                  custId: req.user.id,
                  number: orderId,
                  grandtotal: total,
                  paymentmethod: payment,
                },
                { transaction: t }
              );

              let cartEntries = [];
              cart.forEach((value) => {
                cartEntries.push({
                  orderId: order.id,
                  custId: req.user.id,
                  addressId: addressId,
                  productId: value.productId,
                  varientId: value.varientId,
                  qty: value.quantity,
                });
              });
              if (cartEntries.length)
                await db.Cart_Detail.bulkCreate(cartEntries, {
                  transaction: t,
                });
              await db.OrderNotification.create({
                orderId: order.id,
                userId: req.user.id,
              });

              // find product list in cart
              let addrdetails = await findAddressList(addressId, {
                transaction: t,
              });
              //end
              await mailer.sendInvoiceForCustomerNew(
                req.body,
                addrdetails,
                orderId,
                req.user,
                { transaction: t }
              );
              let productIds = [];
              cart.forEach((value) => {
                productIds.push(value.productId);
              });
              query.where.id = {
                [Op.in]: productIds,
              };
              query.attributes = ["id", "SellerId"];
              query.include = [
                {
                  model: db.user,
                  attributes: ["id", "email"],
                  required: false,
                  as: "users",
                },
              ];
              const seller = await db.product.findAll(query, {
                transaction: t,
              });

              /* seller email send */
              const sellerProduct = filterSellerProduct(req.body.cart, seller);
              if (sellerProduct && sellerProduct.length) {
                sellerProduct.forEach(async (value) => {
                  const product = {
                    thumbnail: value.thumbnail,
                    productName: value.productName,
                    qty: value.quantity,
                    netPrice: value.netPrice,
                  };
                  const sellerEmail = value.users?.email;
                  const custDetail = {
                    email: customer.email,
                    name: customer.firstName + " " + customer.lastName,
                    phone: customer.phone,
                    email: customer.email,
                  };
                  await mailer.sendInvoiceForSeller(
                    product,
                    addrdetails,
                    orderId,
                    custDetail,
                    sellerEmail,
                    { transaction: t }
                  );
                });
              }
              /* end */
              return t.commit();
            } catch (err) {
              await t.rollback();
              throw new RequestError(err);
            }
          } else {
            var response = Util.getFormatedResponse(false, {
              message: "No found data",
            });
            res.status(response.code).json(response);
          }
        })
        .then((re) => {
          var response = Util.getFormatedResponse(false, {
            message: "Ordered successfully! please check your account",
          });
          res.status(response.code).json(response);
        })
        .catch((err) => {
          var response = Util.getFormatedResponse(false, {
            message: err,
          });
          res.status(response.code).json(response);
        });
    } catch (err) {
      console.log(err);
      var response = Util.getFormatedResponse(false, {
        message: err,
      });
      res.status(response.code).json(response);
    }
  },
  async orderHistory(req, res, next) {
    const arrData = [];
    const limit = 100;
    const query = {};
    query.where = {};

    query.where.custId = req.user.id;
    query.attributes = ["id", "number", "grandtotal", "createdAt"];
    query.order = [["createdAt", "DESC"]];
    query.include = [
      {
        model: db.Cart_Detail,
        attributes: ["id", "qty", "status", "deliveryDate"],
        include: [
          {
            model: db.ProductVariant,
            as: "varient",
            attributes: ["id", "productId", "productName", "thumbnail"],
          },
        ],
      },
    ];
    try {
      db.Order.findAndCountAll(query).then((list) => {
        if (list) {
          list.rows.forEach((value) => {
            const dataList = {
              id: value.id,
              OrderNo: value.number,
              OrderDate: value.createdAt,
              Status: value.name,
              Total: value.grandtotal,
              count: value.Cart_Details.length,
              Items: value.Cart_Details,
            };
            arrData.push(dataList);
          });

          let pages = Math.ceil(list.count / limit);
          const finalResult = {
            count: list.count,
            pages: pages,
            items: arrData,
          };
          var response = Util.getFormatedResponse(false, finalResult, {
            message: "Success",
          });
          res.status(response.code).json(response);
        } else {
          var response = Util.getFormatedResponse(false, {
            message: "No found data",
          });
          res.status(response.code).json(response);
        }
      });
    } catch (err) {
      throw new RequestError(err);
    }
  },
  async orderProductList(req, res, next) {
    const arrData = [];
    const query = {};
    query.where = {};

    query.where.orderId = req.body.orderId;
    query.attributes = ["id", "qty", "status", "deliveryDate"];
    query.order = [["createdAt", "DESC"]];
    query.include = [
      {
        model: db.ProductVariant,
        as: "varient",
        attributes: [
          "id",
          "productId",
          "productName",
          "thumbnail",
          "unitSize",
          "netPrice",
        ],
        include: [
          { model: db.ch_brand_detail, as: "brand", attributes: ["name"] },
        ],
      },
    ];
    try {
      db.Cart_Detail.findAll(query).then((list) => {
        if (list) {
          list.forEach((value) => {
            const dataList = {
              id: value.varient ? value.varient.id : null,
              thumbnail: value.varient ? value.varient.thumbnail : null,
              name: value.varient ? value.varient.productName : null,
              qty: value.qty,
              size: value.varient ? value.varient.unitSize : null,
              total: value.varient ? value.qty * value.varient.netPrice : null,
              brand:
                value.varient && value.varient.brand
                  ? value.varient.brand.name
                  : null,
              status: value.status,
            };
            arrData.push(dataList);
          });
          var response = Util.getFormatedResponse(false, arrData, {
            message: "Success",
          });
          res.status(response.code).json(response);
        } else {
          var response = Util.getFormatedResponse(false, {
            message: "No found data",
          });
          res.status(response.code).json(response);
        }
      });
    } catch (err) {
      throw new RequestError(err);
    }
  },
  async orderProductDetail(req, res, next) {
    const query = {};
    query.where = {};

    query.where = {
      [Op.and]: [
        {
          orderId: req.body.orderId,
        },
        {
          varientId: req.body.varientId,
        },
      ],
    };

    query.attributes = ["id", "qty", "status", "deliveryDate"];
    query.order = [["createdAt", "DESC"]];
    query.include = [
      {
        model: db.ProductVariant,
        as: "varient",
        attributes: [
          "id",
          "productId",
          "productName",
          "thumbnail",
          "unitSize",
          "netPrice",
        ],
        include: [
          { model: db.ch_brand_detail, as: "brand", attributes: ["name"] },
        ],
      },
      { model: db.Address, as: "address" },
    ];
    try {
      db.Cart_Detail.findOne(query).then((list) => {
        if (list) {
          const dataList = {
            id: list.id,
            thumbnail: list.varient.thumbnail,
            name: list.varient.productName,
            qty: list.qty,
            size: list.varient.unitSize,
            total: list.qty * list.varient.netPrice,
            brand: list.varient.brand.name,
            status: list.status,
            deliveryDate: list.deliveryDate,
            customerName: list.address.fullname,
            phone: list.address.phone,
            city: list.address.city,
            zone: list.address.states,
            shipping: list.address.shipping,
          };
          var response = Util.getFormatedResponse(false, dataList, {
            message: "Success",
          });
          res.status(response.code).json(response);
        } else {
          var response = Util.getFormatedResponse(false, {
            message: "No found data",
          });
          res.status(response.code).json(response);
        }
      });
    } catch (err) {
      throw new RequestError(err);
    }
  },
  async orderdProductCancel(req, res, next) {
    const { varientId, issue, comment } = req.body;
    try {
      db.Cart_Detail.findOne({
        where: { varientId: varientId },
      })
        .then(async (list) => {
          const t = await db.sequelize.transaction();
          if (list) {
            try {
              await db.Order_Details_Status.create(
                {
                  orderId: list.orderId,
                  custId: req.user.id,
                  productId: list.varientId,
                  status: 0,
                  issue: issue,
                  comment: comment,
                },
                { transaction: t }
              );

              await db.Cart_Detail.update(
                {
                  status: "cancelRequest",
                  deliveryDate: new Date(),
                },
                { where: { id: list.id } }
              );

              return t.commit();
            } catch (err) {
              await t.rollback();
              throw new RequestError(err);
            }
          }
        })
        .then((success) => {
          var response = Util.getFormatedResponse(false, {
            message: "Success",
          });
          res.status(response.code).json(response);
        });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Unfortuntely something is wrong" });
    }
  },
  async collectionList(req, res, next) {
    const query = {};
    query.where = {};
    query.where.sequence = {
      [Op.ne]: 0,
    };
    query.order = [["Sequence", "ASC"]];
    query.attributes = ["id", "name", "slug"];
    query.include = [
      {
        model: db.item,
        attributes: ["id", "name", "slug", "thumbnail"],
      },
    ];
    try {
      db.collection
        .findAll(query)
        .then((list) => {
          let response = Util.getFormatedResponse(false, list, {
            message: "Successfully",
          });
          res.status(response.code).json(response);
        })
        .catch((error) => {
          let response = Util.getFormatedResponse(false, {
            message: error,
          });
          res.status(response.code).json(response);
        });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Unfortuntely something is wrong" });
    }
  },
  async flashSale(req, res, next) {
    const arrData = [];
    const flashArr = [];

    const query = {};
    query.where = {};
    query.where.status = 1;
    query.include = [
      {
        model: db.ch_flash_sale_item,
        order: [["createdAt", "DESC"]],
        as: "flashSaleItem",
        attributes: ["id"],
        include: [
          {
            model: db.product,
            as: "productList",
            attributes: ["id", "name", "slug"],
            include: [
              {
                model: db.ProductVariant,
                include: [
                  {
                    model: db.ch_brand_detail,
                    as: "brand",
                    attributes: ["id", "name", "slug"],
                  },
                  {
                    model: db.ch_color_detail,
                    as: "color",
                    attributes: ["id", "TITLE", "CODE"],
                  },
                ],
              },
            ],
          },
        ],
      },
    ];
    try {
      db.ch_flash_sale
        .findAll(query)
        .then((list) => {
          if (list && list.length) {
            list.forEach((flashSale) => {
              flashSale.flashSaleItem.forEach((item) => {
                const dataList = {
                  ProductId: item.productList.id,
                  VarientId: item.productList.ProductVariants[0]
                    ? item.productList.ProductVariants[0].id
                    : null,
                  Name: item.productList.name,
                  slug: item.productList.slug,
                  qty: item.productList.ProductVariants[0]
                    ? item.productList.ProductVariants[0].qty
                    : null,
                  Thumbnail: item.productList.ProductVariants[0]
                    ? item.productList.ProductVariants[0].thumbnail
                    : null,
                  distributorPrice: item.productList.ProductVariants[0]
                    ? item.productList.ProductVariants[0].distributorPrice
                    : null,
                  netPrice: item.productList.ProductVariants[0]
                    ? item.productList.ProductVariants[0].netPrice
                    : null,
                  discount: item.productList.ProductVariants[0]
                    ? item.productList.ProductVariants[0].discount
                    : null,
                  discountPer: item.productList.ProductVariants[0]
                    ? item.productList.ProductVariants[0].discountPer
                    : null,
                  badges: "flash",
                };
                arrData.push(dataList);
              });
            });
            list.forEach((flashSale) => {
              let flash = {
                title: flashSale.title,
                thumbnail: flashSale.thumbnail,
                slug: flashSale.slug,
                startDate: flashSale.startDate,
                endDate: flashSale.endDate,
                product: arrData,
              };
              flashArr.push(flash);
            });
          }
          let response = Util.getFormatedResponse(false, flashArr, {
            message: "Successfully",
          });
          res.status(response.code).json(response);
        })
        .catch((error) => {
          let response = Util.getFormatedResponse(false, {
            message: error,
          });
          res.status(response.code).json(response);
        });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Unfortuntely something is wrong" });
    }
  },
  async areaList(req, res, next) {
    try {
      db.area
        .findAll({
          where: { locationId: req.body.id },
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
  async getAllBrandList(req, res, next) {
    try {
      db.ch_brand_detail
        .findAll({
          order: [["createdAt", "DESC"]],
          order: [
            ["id", "DESC"],
            ["name", "ASC"],
          ],
          attributes: ["id", "name", "slug", "thumbnail"],
        })
        .then((list) => {
          res.status(200).json({
            status: 200,
            data: list,
          });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError(err);
    }
  },
};
