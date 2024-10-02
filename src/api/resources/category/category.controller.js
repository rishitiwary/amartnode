import { db } from "../../../models";
const { Op } = require("sequelize");
var Util = require("../../../helpers/Util");

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
  /* Add user api start here................................*/

  async addCategory(req, res, next) {
    try {
      const { name, slug, title, keyword, desc } = req.body;
      db.category
        .findOne({ where: { name: name } })
        .then((data) => {
          if (data) {
            return db.category.update(
              { slug: slug },
              { where: { id: data.id } }
            );
          }
          return db.category.create({
            name: name,
            slug: slug,
            title: title,
            keyword: keyword,
            desc: desc,
          });
        })
        .then((category) => {
          res
            .status(200)
            .json({ success: true, msg: "Successfully inserted category" });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  async addSubCategory(req, res, next) {
    try {
      const { categoryId, sub_name, slug, keyword, desc } = req.body;
      db.SubCategory.findOne({ where: { sub_name: sub_name } })
        .then((data) => {
          if (data) {
            throw new RequestError("Category already exist", 409);
          }
          return db.SubCategory.create({
            categoryId: categoryId,
            sub_name: sub_name,
            slug: slug,
            keyword: keyword,
            desc: desc,
          });
        })
        .then((category) => {
          let response = Util.getFormatedResponse(false, {
            message: "Success created",
          });
          res.status(response.code).json(response);
        })
        .catch(function (err) {
          console.log(err);

          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  async addSubChildCategory(req, res, next) {
    try {
      const { categoryId, subcategoryId, name } = req.body;
      db.SubChildCategory.findOne({ where: { name: name } })
        .then((data) => {
          if (data) {
            throw new RequestError("Category already exist", 409);
          }
          return db.SubChildCategory.create({
            categoryId: categoryId,
            subcategoryId: subcategoryId,
            name: name,
            slug: convertToSlug(name),
          });
        })
        .then((category) => {
          let response = Util.getFormatedResponse(false, {
            message: "Success created",
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

  async updateCategory(req, res, next) {
    try {
      const { childcategoryId, subcategoryId, sub_name, name, keyword, desc } =
        req.body;
      db.SubCategory.findOne({ where: { id: subcategoryId } }).then((data) => {
        if (data) {
          return db.SubCategory.update(
            { sub_name: sub_name, keyword: keyword, desc: desc },
            { where: { id: subcategoryId } }
          );
        }
        throw new RequestError("Category Not Found", 409);
      });
      db.SubChildCategory.findOne({ where: { id: childcategoryId } })
        .then((data) => {
          if (data) {
            return db.SubChildCategory.update(
              { name: name },
              { where: { id: childcategoryId } }
            );
          }
          throw new RequestError("Category Not Found", 409);
        })
        .then((category) => {
          res.status(200).json({ success: true, msg: "Successfully Updated" });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  async getCategoryList(req, res, next) {
    try {
      db.category
        .findAll({
          attributes: ["id", "name"],
          include: [{ model: db.SubCategory }],
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

  async getSubCategoryList(req, res, next) {
    try {
      db.SubCategory.findAll({
        where: { categoryId: req.query.categoryId },
        include: [{ model: db.category, attributes: ["id", "name"] }],
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

  async getSubChildCategoryList(req, res, next) {
    try {
      const { subcategoryId } = req.query;
      db.SubChildCategory.findAll({
        where: { subcategoryId: subcategoryId },
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

  async getSubChildList(req, res, next) {
    const arrData = [];
    const query = {};
    query.where = {};
    query.order = [["createdAt", "DESC"]];
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const page = req.query.page ? Number(req.query.page) : 1;
    query.limit = limit;
    query.offset = limit * (page - 1);

    if (req.query.searchString) {
      query.where = {
        name: { [Op.like]: `%${req.query.searchString}%` },
      };
    }
    query.include = [
      {
        model: db.SubCategory,
        attributes: ["id", "sub_name"],
        required: false,
      },
      {
        model: db.category,
        as: "category",
        attributes: ["id", "name"],
        required: false,
      },
    ];
    try {
      await db.SubChildCategory.findAndCountAll(query)
        .then((list) => {
          if (list.count === 0) {
            let response = Util.getFormatedResponse(false, {
              message: "No data found",
            });
            res.status(response.code).json(response);
          } else {
            list.rows.forEach((value) => {
              const dataList = {
                id: value.id,
                name: value.name,
                SubCat: value.SubCategory ? value.SubCategory.sub_name : "",
                MainCat: value.category ? value.category.name : "",
                title: value.title,
                keyword: value.keyword,
                desc: value.desc,
              };
              arrData.push(dataList);
            });
            let pages = Math.ceil(list.count / limit);
            const finalResult = {
              count: list.count,
              pages: pages,
              page: page,
              items: arrData,
            };
            let response = Util.getFormatedResponse(false, finalResult, {
              message: "Success",
            });
            res.status(response.code).json(response);
          }
        })
        .catch(function (err) {
          console.log(err);
          next(err);
        });
    } catch (err) {
      throw new RequestError(err);
    }
  },

  async getCategoryById(req, res, next) {
    try {
      let categoryId = req.query.categoryId;
      db.SubChildCategory.findAll({
        where: { categoryId: categoryId },
        include: [
          {
            model: db.SubCategory,
            attributes: ["id", "sub_name"],
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

  // category list
  async getMainList(req, res, next) {
    try {
      db.category
        .findAll({
          where: { status: 1 },
          order: [["name", "desc"]],
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

  async getSearchdropdown(req, res, next) {
    let { search_text } = req.body;
    let search = "%%";
    if (search_text) {
      search = "%" + search_text + "%";
    }

    try {
      let result = {};
      result.maincat = await db.category.findAll({
        where: { name: { [Op.like]: search }, status: "1" },
      });
      result.subchild = await db.SubChildCategory.findAll({
        where: { name: { [Op.like]: search } },
      });

      result.subcat = await db.SubCategory.findAll({
        where: { sub_name: { [Op.like]: search } },
      });
      result.brand = await db.ch_brand_detail.findAll({
        where: { name: { [Op.like]: search }, status: true },
      });
      result.product = await db.product.findAll({
        where: { name: { [Op.like]: search }, status: "1" },
      });
      result.varient = await db.ProductVariant.findAll({
        where: { productName: { [Op.like]: search } },
      });
      var newList = [];
      if (result.maincat) {
        for (let i = 0; i < result.maincat.length; i++) {
          const assignee = result.maincat[i];
          let assigneeData = {
            id: assignee.id,
            name: assignee.name,
          };
          newList.push(assigneeData);
        }
      }
      if (result.subcat) {
        for (let i = 0; i < result.subcat.length; i++) {
          const assignee = result.subcat[i];
          let assigneeData = {
            id: assignee.id,
            name: assignee.sub_name,
          };
          newList.push(assigneeData);
        }
      }
      if (result.brand) {
        for (let i = 0; i < result.brand.length; i++) {
          const assignee = result.brand[i];
          let assigneeData = {
            id: assignee.id,
            name: assignee.name,
          };
          newList.push(assigneeData);
        }
      }
      if (result.subchild) {
        for (let i = 0; i < result.subchild.length; i++) {
          const assignee = result.subchild[i];
          let assigneeData = {
            id: assignee.id,
            name: assignee.name,
          };
          newList.push(assigneeData);
        }
      }
      if (result.product) {
        for (let i = 0; i < result.product.length; i++) {
          const assignee = result.product[i];
          let assigneeData = {
            id: assignee.id,
            name: assignee.name,
          };
          newList.push(assigneeData);
        }
      }
      if (result.varient) {
        for (let i = 0; i < result.varient.length; i++) {
          const assignee = result.varient[i];
          let assigneeData = {
            id: assignee.id,
            name: assignee.productName,
          };
          newList.push(assigneeData);
        }
      }
      res.status(200).json({ success: true, data: newList });
    } catch (err) {
      throw new RequestError(err);
    }
  },

  async getAdminMainList(req, res, next) {
    try {
      db.category
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

  async getMainListUpdate(req, res, next) {
    try {
      const { id, name, thumbnail, status, title, keyword, desc } = req.body;
      db.category
        .findOne({ where: { id: id } })
        .then((data) => {
          if (data) {
            return db.category.update(
              {
                name: name ? name : data.name,
                slug: name ? convertToSlug(name) : data.slug,
                thumbnail: req.file ? req.file.location : data.thumbnail,
                status: status ? status : data.status,
                title: title ? title : data.title,
                keyword: keyword ? keyword : data.keyword,
                desc: desc ? desc : data.desc,
              },
              { where: { id: data.id } }
            );
          }
          throw new RequestError("Category is not found");
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
      throw new RequestError("Error");
    }
  },
  async getMainCatDelete(req, res, next) {
    try {
      db.category
        .findOne({ where: { id: parseInt(req.query.id) } })
        .then((list) => {
          if (list) {
            return db.category.destroy({ where: { id: list.id } });
          }
          throw new RequestError("Id is not found");
        })
        .then((re) => {
          var response = Util.getFormatedResponse(false, {
            message: "Successfully deleted category",
          });
          res.status(response.code).json(response);
        })
        .catch((err) => {
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },
  // Sub category list
  async getSubCategory(req, res, next) {
    const query = {};
    query.where = {};
    query.order = [["id", "DESC"]];
    if (req.query.searchString) {
      query.where = {
        sub_name: { [Op.like]: `%${req.query.searchString}%` },
      };
    }
    query.include = [{ model: db.category, attributes: ["id", "name"] }];
    try {
      db.SubCategory.findAll(query)
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
  async getSubCatListUpdate(req, res, next) {
    try {
      const { id, sub_name, title, desc, keyword } = req.body;
      db.SubCategory.findOne({ where: { id: id } })
        .then((data) => {
          if (data) {
            return db.SubCategory.update(
              {
                sub_name: sub_name,
                slug: sub_name ? convertToSlug(sub_name) : data.slug,
                title: title ? title : data.title,
                keyword: keyword ? keyword : data.keyword,
                desc: desc ? desc : data.desc,
              },
              { where: { id: data.id } }
            );
          }
          throw new RequestError("Sub_Category is not found");
        })
        .then((category) => {
          res
            .status(200)
            .json({ success: true, msg: "Successfully Updated Sub_Category" });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  async getDeletedSubCatList(req, res, next) {
    try {
      db.SubCategory.findOne({ where: { id: parseInt(req.query.id) } })
        .then((list) => {
          if (list) {
            return db.SubCategory.destroy({ where: { id: list.id } });
          }
          throw new RequestError("Id is not found");
        })
        .then((re) => {
          return res.status(200).json({
            msg: "success",
            status: "deleted Sub_Category Seccessfully",
          });
        })
        .catch((err) => {
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  //child category
  async deleteCategory(req, res, next) {
    db.SubChildCategory.findOne({ where: { id: parseInt(req.query.id) } })
      .then((data) => {
        if (data) {
          return db.SubChildCategory.destroy({ where: { id: data.id } }).then(
            (r) => [r, data]
          );
        }
        throw new RequestError("child_category is not found");
      })
      .then((re) => {
        return res
          .status(200)
          .json({ status: "deleted category Seccessfully" });
      })
      .catch((err) => {
        next(err);
      });
  },
  async childCatUpdate(req, res, next) {
    try {
      const { id, name, title, keyword, desc } = req.body;
      db.SubChildCategory.findOne({ where: { id: id } })
        .then((data) => {
          if (data) {
            return db.SubChildCategory.update(
              {
                name: name ? name : data.name,
                slug: name ? convertToSlug(name) : data.slug,
                title: title ? title : data.title,
                keyword: keyword ? keyword : data.keyword,
                desc: desc ? desc : data.desc,
              },
              { where: { id: data.id } }
            );
          }
          throw new RequestError("Category is not found");
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
      throw new RequestError("Error");
    }
  },
  async getAllCategoryBySlug(req, res, next) {
    try {
      db.category
        .findOne({
          where: { slug: req.query.slug },
          include: [
            {
              model: db.SubCategory,
              include: [{ model: db.SubChildCategory }],
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

  async filterByCategoryList(req, res, next) {
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
    let { id, brandId } = req.body;
    console.log(req.body);

    //-----Criteria|start|----------
    let wherecond = {};
    if (id) {
      (wherecond.childCategoryId = id), (wherecond.status = "active");
    }
    if (brandId) {
      wherecond.brandId = brandId;
      wherecond.status = "active";
    }
    try {
      db.product
        .count({
          where: wherecond,
          include: [
            { model: db.productphoto, attributes: ["id", "imgUrl"] },
            { model: db.ProductVariant },
          ],
        })
        .then((count) => {
          let pages = Math.ceil(count / limit);
          offset = limit * (page - 1);
          return db.product
            .findAll({
              where: wherecond,
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
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  async getFilterbyCategory(req, res, next) {
    try {
      let { id, name } = req.body;
      db.SubCategory.findOne({
        attributes: ["id", "sub_name"],
        where: { id: id, sub_name: name },
        include: [{ model: db.SubChildCategory }],
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

  async getProductBySubcategory(req, res, next) {
    try {
      let { id, name } = req.body;
      let search = "%%";
      if (name) {
        search = "%" + name + "%";
      }
      db.SubCategory.findAll({
        attributes: ["id", "sub_name"],
        include: [
          {
            model: db.product,
            order: [["createdAt", "DESC"]],
            required: true,
            where: {
              [Op.or]: [{ name: { [Op.like]: search }, subCategoryId: id }],
            },
            include: [{ model: db.ProductVariant }],
          },
        ],
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

  async getFilterbyChildCategory(req, res, next) {
    try {
      let { id } = req.body;
      db.product
        .findAll({
          where: { childCategoryId: id, status: "active" },
          include: [
            { model: db.productphoto, attributes: ["id", "imgUrl"] },
            { model: db.ProductVariant },
          ],
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

  async getBrandCatList(req, res, next) {
    let { slug } = req.body;
    let wherecond = {};
    if (slug) {
      wherecond.slug = slug;
    }
    try {
      let result = {};
      result.category = await db.category.findOne({
        where: wherecond,
        // attributes: ["id", "name"],
        include: [{ model: db.SubChildCategory, required: false }],
      });
      result.subcat = await db.SubCategory.findOne({
        where: wherecond,
        // attributes: ["id", "sub_name"],
        include: [{ model: db.SubChildCategory, required: false }],
      });
      if (result) {
        db.ch_brand_detail
          .findAll({
            include: [
              {
                model: db.product,
                attributes: ["id"],
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
              },
            ],
          })
          .then((brand) => {
            res.status(200).json({ success: true, brand: brand, list: result });
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

  async getAllCovidProduct(req, res, next) {
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
    try {
      db.product
        .count({
          where: { childCategoryId: "66", status: "active" },
          include: [
            { model: db.productphoto, attributes: ["id", "imgUrl"] },
            { model: db.ProductVariant },
          ],
        })
        .then((count) => {
          let pages = Math.ceil(count / limit);
          offset = limit * (page - 1);
          return db.product
            .findAll({
              where: { childCategoryId: "66", status: "active" },
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
    } catch (err) {
      console.log(err);
      throw new RequestError("Error");
    }
  },
  async createSuperCat(req, res, next) {
    try {
      const { Name, categoryId, Slug } = req.body;
      db.Ch_Super_Category.findOne({ where: { Name: Name } })
        .then(async (data) => {
          if (!data) {
            const t = await db.sequelize.transaction();
            try {
              let categoryIds = [];
              for (var i = 0; i < categoryId.length; i++) {
                categoryIds.push({
                  Name: Name,
                  Slug: Slug,
                  CategoryId: categoryId[i],
                  Status: true,
                });
              }
              if (categoryIds.length)
                await db.Ch_Super_Category.bulkCreate(categoryIds, {
                  transaction: t,
                });

              return t.commit();
            } catch (error) {
              await t.rollback();
              throw error;
            }
          }
          throw new RequestError("Category already exist", 409);
        })
        .then((category) => {
          res.status(200).json({
            status: 200,
            success: true,
            message: "Successfully inserted category",
          });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },
  async SuperCategoryList(req, res, next) {
    try {
      db.Ch_Super_Category.findAll({
        attributes: ["id", "Name", "Slug", "Sequence"],
        include: [
          {
            model: db.category,
            as: "category",
            attributes: ["id", "name", "thumbnail"],
          },
        ],
        order: [["createdAt", "DESC"]],
      })
        .then((cat) => {
          const catlist = [];
          cat.forEach((element) => {
            let match = catlist.find((r) => r.Name == element.Name);
            if (match) {
              return true;
            } else {
              catlist.push({
                id: element.id,
                Sequence: element.Sequence,
                Name: element.Name,
                Slug: element.Slug,
                category: [],
              });
            }
          });
          catlist.map((item) => {
            cat.map((e) => {
              if (e.Name == item.Name) {
                if (typeof e.category == "object") {
                  item.category.push(e.category);
                } else {
                  item.category.push(e.category);
                }
              }
            });
          });
          res.status(200).json({
            status: 200,
            message: "Successfully",
            success: true,
            data: catlist,
          });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError(err);
    }
  },
  async SuperCategoryDelete(req, res, next) {
    const { CategoryId } = req.body;
    try {
      db.Ch_Super_Category.findOne({ where: { CategoryId: CategoryId } })
        .then((list) => {
          if (list) {
            return db.Ch_Super_Category.destroy({
              where: { CategoryId: CategoryId },
            });
          }
          throw new RequestError("Id is not found");
        })
        .then((re) => {
          return res
            .status(200)
            .json({ status: 200, success: true, message: "success" });
        })
        .catch((err) => {
          next(err);
        });
    } catch (err) {
      throw new RequestError(err);
    }
  },
  async SuperCategoryUpdate(req, res, next) {
    try {
      const { Name, CategoryId, Slug, Sequence } = req.body;
      db.Ch_Super_Category.findAll({ where: { Name: Name } })
        .then(async (data) => {
          if (data.length) {
            const t = await db.sequelize.transaction();
            try {
              let categoryIds = [];
              for (var i = 0; i < CategoryId.length; i++) {
                categoryIds.push({
                  Name: Name,
                  Slug: Slug,
                  CategoryId: CategoryId[i],
                  Status: true,
                });
              }
              const supCatId = [];
              data.forEach((value) => supCatId.push(value.id));
              const updateCat = await db.Ch_Super_Category.update(
                {
                  Name: Name,
                  Slug: Slug,
                  Sequence: Sequence,
                },
                { where: { id: { [Op.in]: supCatId } } },
                { transaction: t }
              );
              if (categoryIds.length)
                await db.Ch_Super_Category.bulkCreate(categoryIds, {
                  transaction: t,
                });
              return t.commit();
            } catch (error) {
              await t.rollback();
              throw error;
            }
          }
          return null;
        })
        .then((category) => {
          return res
            .status(200)
            .json({ status: 200, success: true, message: "Updated category" });
        })
        .catch(function (err) {
          console.log(err);
          next(err);
        });
    } catch (err) {
      throw new RequestError(err);
    }
  },
  async getAllCombine(req, res, next) {
    try {
      let { Search_String } = req.body;
      let search = "%%";
      if (Search_String) {
        search = "%" + Search_String + "%";
      }
      let result = {};
      result.maincat = await db.category.findAll({
        where: { name: { [Op.like]: search } },
        attributes: ["id", "name"],
      });
      result.subcat = await db.SubCategory.findAll({
        where: { sub_name: { [Op.like]: search } },
      });
      if (result.maincat && result.maincat.length) {
        const catIds = [];
        result.maincat.forEach((value) => catIds.push(value.id));
        const query = {};
        query.where = {};
        query.where = {
          categoryId: {
            [Op.in]: catIds,
          },
        };
        query.attributes = ["id", "name"];
        query.include = [
          { model: db.category, attributes: ["id", "name"], as: "category" },
          { model: db.SubCategory, attributes: ["id", "sub_name"] },
        ];
        db.SubChildCategory.findAll(query).then((category) => {
          if (category) {
            const newCat = [];
            category.forEach((value) => {
              const maincat =
                value && value.category ? value.category.name : null;
              const CatId = value && value.category ? value.category.id : null;
              const subcat =
                value && value.SubCategory ? value.SubCategory.sub_name : null;
              const SubCatId =
                value && value.SubCategory ? value.SubCategory.id : null;
              const child = value ? value.name : null;
              newCat.push({
                CatId: CatId,
                SubCatId: SubCatId,
                Child_Id: value.id,
                Name: maincat + " > " + subcat + " > " + child,
              });
            });
            let response = Util.getFormatedResponse(false, newCat, {
              message: "Success",
            });
            res.status(response.code).json(response);
          } else {
            let response = Util.getFormatedResponse(false, {
              message: "Success",
            });
            res.status(response.code).json(response);
          }
        });
      } else if (result.subcat && result.subcat.length) {
        const catIds = [];
        result.subcat.forEach((value) => catIds.push(value.id));
        const query = {};
        query.where = {};
        query.where = {
          subcategoryId: {
            [Op.in]: catIds,
          },
        };
        query.attributes = ["id", "name"];
        query.include = [
          { model: db.category, attributes: ["id", "name"], as: "category" },
          { model: db.SubCategory, attributes: ["id", "sub_name"] },
        ];
        db.SubChildCategory.findAll(query).then((category) => {
          if (category) {
            const newCat = [];
            category.forEach((value) => {
              const maincat =
                value && value.category ? value.category.name : null;
              const CatId = value && value.category ? value.category.id : null;
              const subcat =
                value && value.SubCategory ? value.SubCategory.sub_name : null;
              const SubCatId =
                value && value.SubCategory ? value.SubCategory.id : null;
              const child = value ? value.name : null;
              newCat.push({
                CatId: CatId,
                SubCatId: SubCatId,
                Child_Id: value.id,
                Name: maincat + " > " + subcat + " > " + child,
              });
            });
            let response = Util.getFormatedResponse(false, newCat, {
              message: "Success",
            });
            res.status(response.code).json(response);
          } else {
            let response = Util.getFormatedResponse(false, {
              message: "Success",
            });
            res.status(response.code).json(response);
          }
        });
      } else {
        const query = {};
        query.where = {};

        query.where.name = {
          [Op.like]: `%${Search_String}%`,
        };
        query.attributes = ["id", "name"];
        query.include = [
          { model: db.category, attributes: ["id", "name"], as: "category" },
          { model: db.SubCategory, attributes: ["id", "sub_name"] },
        ];
        db.SubChildCategory.findAll(query).then((category) => {
          if (category) {
            const newCat = [];
            category.forEach((value) => {
              const maincat =
                value && value.category ? value.category.name : null;
              const CatId = value && value.category ? value.category.id : null;
              const subcat =
                value && value.SubCategory ? value.SubCategory.sub_name : null;
              const SubCatId =
                value && value.SubCategory ? value.SubCategory.id : null;
              const child = value ? value.name : null;
              newCat.push({
                CatId: CatId,
                SubCatId: SubCatId,
                Child_Id: value.id,
                Name: maincat + " > " + subcat + " > " + child,
              });
            });
            let response = Util.getFormatedResponse(false, newCat, {
              message: "Success",
            });
            res.status(response.code).json(response);
          } else {
            let response = Util.getFormatedResponse(false, {
              message: "Success",
            });
            res.status(response.code).json(response);
          }
        });
      }
    } catch (err) {
      throw new RequestError(err);
    }
  },
  // website all api
  async getAllCategoryBannerlist(req, res, next) {
    try {
      let result = {};
      result.category = await db.category.findAll({
        attributes: ["id", "name", "slug"],
        where: { status: 1 },
        include: [
          {
            model: db.SubCategory,
            required: false,
            attributes: ["sub_name", "slug"],
            include: [
              {
                model: db.SubChildCategory,
                required: false,
                attributes: ["id", "name"],
              },
            ],
          },
        ],
      });
      result.banner = await db.BannerDetail.findAll({
        where: { status: 1 },
        attributes: ["id", "banner", "slug"],
      });
      if (result) {
        res.status(200).json({
          status: 200,
          message: "Successfully",
          success: true,
          banner: result.banner,
          category: result.category,
        });
      }
    } catch (err) {
      console.log(err);
      throw new RequestError("Error");
    }
  },
};
