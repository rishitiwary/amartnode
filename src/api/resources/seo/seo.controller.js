import { db } from "../../../models";
const { Op, where } = require("sequelize");
var Util = require("../../../helpers/Util");
export default {
  /* Add user api start here................................*/

  async seoList(req, res, next) {
    const { searchString } = req.body;
    const query = {};
    query.where = {};

    if (searchString) {
      query.where = {
        [Op.or]: [
          {
            name: {
              [Op.like]: "%" + searchString + "%",
            },
          },
          {
            id: searchString,
          },
          {
            slug: {
              [Op.like]: "%" + searchString + "%",
            },
          },
        ],
      };
    }
    const limit = req.body.limit ? Number(req.body.limit) : 10;
    const page = req.body.page ? Number(req.body.page) : 1;
    query.limit = limit;
    query.offset = limit * (page - 1);
    query.where.SellerId = {
      [Op.not]: null,
    };
    query.order = [["id", "DESC"]];
    query.attributes = ["id", "SellerId", "name"];
    try {
      db.product
        .findAndCountAll({
          ...query,
          include: [{ model: db.Seo_Details }],
        })
        .then((list) => {
          if (list.count === 0) {
            let response = Util.getFormatedResponse(false, {
              message: "No data found",
            });
            res.status(response.code).json(response);
          } else {
            const arrayList = [];
            list.rows.forEach((value) => {
              const dataList = {
                productId: value.id,
                name: value.name,
                seoId:
                  value && value.Seo_Details && value.Seo_Details.length
                    ? value.Seo_Details[0].id
                    : null,
                title:
                  value && value.Seo_Details && value.Seo_Details.length
                    ? value.Seo_Details[0].meta_title
                    : null,
                keyword:
                  value && value.Seo_Details && value.Seo_Details.length
                    ? value.Seo_Details[0].meta_keyword
                    : null,
                description:
                  value && value.Seo_Details && value.Seo_Details.length
                    ? value.Seo_Details[0].meta_desc
                    : null,
              };
              arrayList.push(dataList);
            });
            let pages = Math.ceil(list.count / limit);
            const finalResult = {
              count: list.count,
              pages: pages,
              page: req.body.page,
              items: arrayList,
            };
            let response = Util.getFormatedResponse(false, finalResult, {
              message: "Success",
            });
            res.status(response.code).json(response);
          }
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      next(err);
    }
  },
  async seoUpdate(req, res, next) {
    let { id, productId, title, description, keyword } = req.body;
    try {
      db.Seo_Details.findOne({ where: { id: id } })
        .then((list) => {
          if (list) {
            return db.Seo_Details.update(
              {
                meta_title: title,
                meta_desc: description,
                meta_keyword: keyword,
              },
              { where: { id: id } }
            );
          } else {
            return db.Seo_Details.create({
              productId: productId,
              meta_title: title,
              meta_desc: description,
              meta_keyword: keyword,
            });
          }
        })
        .then((re) => {
          return res
            .status(200)
            .json({ success: true, msg: "Successfully Upated" });
        })
        .catch((err) => {
          next(err);
        });
    } catch (err) {
      throw new RequestError(err);
    }
  },

  async seoDelete(req, res, next) {
    try {
      db.Seo_Details.findOne({ where: { id: req.body.id } })
        .then((list) => {
          if (list) {
            return db.Seo_Details.destroy({ where: { id: list.id } });
          }
          throw new RequestError("Seo_Details is not found");
        })
        .then((re) => {
          return res
            .status(200)
            .json({ message: "success", status: "deleted seo Seccessfully" });
        })
        .catch((err) => {
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },
};
