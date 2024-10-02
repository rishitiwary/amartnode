import { db } from "../../../models";
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
var Util = require("../../../helpers/Util");

export default {
  async getAllvendor(req, res, next) {
    try {
      db.user
        .findAll({
          where: { role: "seller" },
          attributes: [
            "id",
            "firstName",
            "lastName",
            "phone",
            "role",
            "verify",
            "email",
          ],
          order: [["createdAt", "DESC"]],
          include: [{ model: db.ch_seller_shopdetail }],
        })
        .then((user) => {
          res.status(200).json({ status: 200, success: true, data: user });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError(err);
    }
  },
  async sellerProductList(req, res, next) {
    try {
      const { SellerId, searchString } = req.query;
      let arrData = [];
      const query = {};
      query.where = {};
      try {
        let search = "%%";
        if (searchString) {
          search = "%" + searchString + "%";
        }
        //limit
        const limit = req.query.limit ? Number(req.query.limit) : 10;
        const page = req.query.page ? Number(req.query.page) : 1;
        query.offset = (page - 1) * limit;
        query.limit = limit;
        query.productName = {
          [Op.like]: "%" + search + "%",
        };
        query.order = [
          ["id", "DESC"],
          ["productName", "ASC"],
        ];
        query.include = [
          {
            model: db.product,
            where: {
              SellerId: SellerId,
            },
            offset: limit * (page - 1),
            attributes: [
              "id",
              "SellerId",
              "PubilshStatus",
              "categoryId",
              "subCategoryId",
              "childCategoryId",
            ],
            include: [
              { model: db.category, as: "maincat", attributes: ["id", "name"] },
              { model: db.SubCategory, attributes: ["id", "sub_name"] },
              { model: db.SubChildCategory, attributes: ["id", "name"] },
            ],
          },
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
          { model: db.productphoto, attributes: ["id", "imgUrl"] },
        ];
        const productlist = await db.ProductVariant.findAndCountAll({
          ...query,
        });
        if (productlist.count === 0) {
          let response = Util.getFormatedResponse(false, {
            message: "No data found",
          });
          res.status(response.code).json(response);
        } else {
          productlist.rows.forEach((value) => {
            const dataList = {
              id: value ? value.id : "",
              productId: value.product ? value.product.id : "",
              name: value ? value.productName : "",
              code: value ? value.productCode : "",
              slug: value ? value.slug : null,
              Available: value ? value.Available : null,
              qty: value ? value.qty : null,
              thumbnail: value ? value.thumbnail : null,
              distributorPrice: value ? value.distributorPrice : null,
              marginPer: value ? value.marginPer : null,
              marginPrice: value ? value.marginPrice : null,
              buyerPrice: value ? value.buyerPrice : null,
              qty: value ? value.qty : null,
              discount: value ? value.discount : null,
              discountPer: value ? value.discountPer : null,
              total: value ? value.total : null,
              netPrice: value ? value.netPrice : null,
              sellerPrice: value ? value.sellerPrice : null,
              maincat: value.product ? value.product.maincat.name : null,
              BrandName: value.brand ? value.brand : null,
              subcat: value.product.SubCategory
                ? value.product.SubCategory.sub_name
                : "",
              childcat: value.product.SubChildCategory
                ? value.product.SubChildCategory.name
                : "",
              PubilshStatus: value.product.PubilshStatus,
            };
            arrData.push(dataList);
          });
          let pages = Math.ceil(productlist.count / limit);
          const finalResult = {
            count: productlist.count,
            pages: pages,
            items: arrData,
          };
          let response = Util.getFormatedResponse(false, finalResult, {
            message: "Success",
          });
          res.status(response.code).json(response);
        }
      } catch (err) {
        throw new RequestError(err);
      }
    } catch (err) {
      throw new RequestError(err);
    }
  },
  async websiteVendorContactCreate(req, res, next) {
    let { fullname, email, phoneNo, message } = req.body;
    try {
      db.chit_seller_contact
        .findOne({ where: { email: email } })
        .then((data) => {
          return db.chit_seller_contact.create({
            FULLNAME: fullname,
            EMAIL: email,
            PHONENO: phoneNo,
            MESSAGE: message,
          });
        })
        .then((re) => {
          return res.status(200).json({
            success: true,
            message: "Seccessfully Added in list we will contact soon",
          });
        })
        .catch((err) => {
          next(err);
          res.status(500).json({ success: false, message: err });
        });
    } catch (err) {
      res.status(500).json({ success: false, message: err });
      // throw new RequestError('Error');
    }
  },

  async websiteVendorContactList(req, res, next) {
    try {
      db.chit_seller_contact
        .findAll({
          order: [["createdAt", "DESC"]],
        })
        .then((re) => {
          return res.status(200).json({ success: true, data: re });
        })
        .catch((err) => {
          next(err);
          res.status(500).json({ success: false, message: err });
        });
    } catch (err) {
      res.status(500).json({ success: false, message: err });
      // throw new RequestError('Error');
    }
  },

  //new api create

  async sellerShopCreate(req, res, next) {
    const {
      id,
      SHOPNAME,
      PHONE,
      ADDRESS,
      CITY,
      PICKUPADDRESS,
      DESCRIPTION,
      BANKNAME,
      BANKACCOUNTNO,
      BANKACCOUNTHOLDERNAME,
      BANKBRANCH,
    } = req.body;
    try {
      db.ch_seller_shopdetail
        .findOne({
          where: { SHOPNAME: SHOPNAME },
        })
        .then((list) => {
          if (!list) {
            return db.ch_seller_shopdetail.create({
              SELLERID: req.user.id,
              SHOPNAME: SHOPNAME,
              PHONE: PHONE,
              ADDRESS: ADDRESS,
              CITY: CITY,
              PICKUPADDRESS: PICKUPADDRESS,
              DESCRIPTION: DESCRIPTION,
              BANKNAME: BANKNAME,
              BANKACCOUNTNO: BANKACCOUNTNO,
              BANKACCOUNTHOLDERNAME: BANKACCOUNTHOLDERNAME,
              BANKBRANCH: BANKBRANCH,
            });
          }
          return db.ch_seller_shopdetail.update(
            {
              SELLERID: req.user.id,
              SHOPNAME: SHOPNAME ? SHOPNAME : list.SHOPNAME,
              PHONE: PHONE ? PHONE : list.PHONE,
              ADDRESS: ADDRESS ? ADDRESS : list.ADDRESS,
              CITY: CITY ? CITY : list.CITY,
              PICKUPADDRESS: PICKUPADDRESS ? PICKUPADDRESS : list.PICKUPADDRESS,
              DESCRIPTION: DESCRIPTION ? DESCRIPTION : list.DESCRIPTION,
              BANKNAME: BANKNAME ? BANKNAME : list.BANKNAME,
              BANKACCOUNTNO: BANKACCOUNTNO ? BANKACCOUNTNO : list.BANKACCOUNTNO,
              BANKACCOUNTHOLDERNAME: BANKACCOUNTHOLDERNAME
                ? BANKACCOUNTHOLDERNAME
                : list.BANKACCOUNTHOLDERNAME,
              BANKBRANCH: BANKBRANCH ? BANKBRANCH : list.BANKBRANCH,
            },
            { where: { id: list.id } }
          );
        })
        .then((success) => {
          res
            .status(200)
            .json({ status: 200, success: true, message: "Successfully" });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError(err);
    }
  },

  async sellerShopDetail(req, res, next) {
    try {
      db.ch_seller_shopdetail
        .findAll({
          where: { SELLERID: req.user.id },
        })
        .then((list) => {
          res.status(200).json({ status: 200, success: true, data: list });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError(err);
    }
  },

  async sellerShopDelete(req, res, next) {
    try {
      db.ch_seller_shopdetail
        .findOne({ where: { id: parseInt(req.query.id) } })
        .then((data) => {
          if (data) {
            return db.ch_seller_shopdetail.destroy({ where: { id: data.id } });
          }
          throw new RequestError("Sellar is not found");
        })
        .then((re) => {
          return res
            .status(200)
            .json({ success: true, message: "deleted  Seccessfully" });
        })
        .catch((err) => {
          next(err);
        });
    } catch (err) {
      throw new RequestError(err);
    }
  },
};
