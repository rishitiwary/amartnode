import express from "express";
import categoryController from "./category.controller";
import { jwtStrategy } from "../../../middleware/strategy";
import { sanitize } from "../../../middleware/sanitizer";
// import { validateBody, schemas } from '../../../middleware/validator';
import upload from "../../../awsbucket";

export const categoryRouter = express.Router();
categoryRouter
  .route("/getAllCategory")
  .get(sanitize(), categoryController.getCategoryList);
categoryRouter
  .route("/getAllSubCategory")
  .get(sanitize(), categoryController.getSubCategoryList);
categoryRouter
  .route("/getAllSubChildCategory")
  .get(sanitize(), categoryController.getSubChildCategoryList);
categoryRouter.route("/create").post(categoryController.addCategory);
categoryRouter
  .route("/child-list")
  .get(sanitize(), categoryController.getSubChildList);
categoryRouter
  .route("/getCategoryById")
  .get(sanitize(), categoryController.getCategoryById);
categoryRouter
  .route("/create-sub")
  .post(sanitize(), jwtStrategy, categoryController.addSubCategory);
categoryRouter
  .route("/create-sub-child")
  .post(sanitize(), jwtStrategy, categoryController.addSubChildCategory);
categoryRouter
  .route("/update")
  .post(sanitize(), jwtStrategy, categoryController.updateCategory);
categoryRouter
  .route("/search/allcombine")
  .post(sanitize(), categoryController.getAllCombine);

//category list
categoryRouter
  .route("/super-create")
  .post(sanitize(), jwtStrategy, categoryController.createSuperCat);
categoryRouter
  .route("/super-update")
  .put(sanitize(), jwtStrategy, categoryController.SuperCategoryUpdate);
categoryRouter
  .route("/super-list")
  .get(sanitize(), jwtStrategy, categoryController.SuperCategoryList);
categoryRouter
  .route("/super/delete")
  .post(sanitize(), jwtStrategy, categoryController.SuperCategoryDelete);
categoryRouter
  .route("/main-list")
  .get(sanitize(), categoryController.getMainList);
categoryRouter
  .route("/search-by-value")
  .post(sanitize(), categoryController.getSearchdropdown);
categoryRouter
  .route("/admin/main-list")
  .get(sanitize(), jwtStrategy, categoryController.getAdminMainList);
categoryRouter
  .route("/main-list/update")
  .post(
    jwtStrategy,
    upload.single("thumbnail"),
    categoryController.getMainListUpdate
  );
categoryRouter
  .route("/main/delete")
  .delete(sanitize(), jwtStrategy, categoryController.getMainCatDelete);

//sub category list
categoryRouter
  .route("/sub-list")
  .get(sanitize(), categoryController.getSubCategory);
categoryRouter
  .route("/sub-list/update")
  .post(sanitize(), jwtStrategy, categoryController.getSubCatListUpdate);
categoryRouter
  .route("/sub-list/delete")
  .delete(sanitize(), jwtStrategy, categoryController.getDeletedSubCatList);

//child category
categoryRouter
  .route("/child/deleteById")
  .delete(sanitize(), jwtStrategy, categoryController.deleteCategory);
categoryRouter
  .route("/child/update")
  .put(sanitize(), jwtStrategy, categoryController.childCatUpdate);

//get all category by slug
categoryRouter
  .route("/cn/list")
  .get(sanitize(), categoryController.getAllCategoryBySlug);
categoryRouter
  .route("/findbysubchild")
  .post(sanitize(), categoryController.filterByCategoryList);
categoryRouter
  .route("/covid-offer/senetry-pad")
  .get(sanitize(), categoryController.getAllCovidProduct);

//Searching filter category
categoryRouter
  .route("/catlogsearch/child-category")
  .post(sanitize(), categoryController.getFilterbyCategory);
categoryRouter
  .route("/catlogsearch/product")
  .post(sanitize(), categoryController.getProductBySubcategory);
categoryRouter
  .route("/subcatlog/search/product")
  .post(sanitize(), categoryController.getFilterbyChildCategory);
categoryRouter
  .route("/category-brand-list")
  .post(sanitize(), categoryController.getBrandCatList);

// for website all api
categoryRouter
  .route("/banner-category-list")
  .get(sanitize(), categoryController.getAllCategoryBannerlist);
