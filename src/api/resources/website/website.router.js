import express from "express";
import websiteController from "./website.controller";
import { sanitize } from "../../../middleware/sanitizer";
import { jwtCustomerStrategy } from "../../../middleware/strategy";
export const websiteRouter = express.Router();
websiteRouter
  .route("/category/list")
  .get(sanitize(), websiteController.getCategoryList);
websiteRouter.route("/image/banner").get(websiteController.getBannerList);
websiteRouter
  .route("/product/new-arrival")
  .get(sanitize(), websiteController.getNewArrival);
websiteRouter
  .route("/product/Pre-owned")
  .get(sanitize(), websiteController.PreownedProduct);
websiteRouter
  .route("/popular/category-list")
  .get(sanitize(), websiteController.getPopularCategory);
websiteRouter
  .route("/product/detail")
  .get(sanitize(), websiteController.getProductDetail);
websiteRouter
  .route("/category/getAllProduct")
  .post(sanitize(), websiteController.getCategoryByProduct);
websiteRouter
  .route("/catalog/product/search")
  .get(sanitize(), websiteController.getFilterAllProduct);
websiteRouter
  .route("/catalog/category/search")
  .get(sanitize(), websiteController.getFilterAllCategoryBrand);
websiteRouter
  .route("/autosuggest/search")
  .get(sanitize(), websiteController.getAutoSuggestList);
websiteRouter
  .route("/relatedProduct")
  .get(sanitize(), websiteController.relatedProduct);
websiteRouter
  .route("/address/create")
  .post(sanitize(), jwtCustomerStrategy, websiteController.createAddress);
websiteRouter
  .route("/order/create")
  .post(sanitize(), jwtCustomerStrategy, websiteController.createOrder);
websiteRouter
  .route("/order/create")
  .post(sanitize(), jwtCustomerStrategy, websiteController.createOrder);
websiteRouter
  .route("/order/history")
  .get(sanitize(), jwtCustomerStrategy, websiteController.orderHistory);
websiteRouter
  .route("/order/product_list")
  .post(sanitize(), jwtCustomerStrategy, websiteController.orderProductList);
websiteRouter
  .route("/order/product_detail")
  .post(sanitize(), jwtCustomerStrategy, websiteController.orderProductDetail);
websiteRouter
  .route("/order/cancel-by-product")
  .post(sanitize(), jwtCustomerStrategy, websiteController.orderdProductCancel);
websiteRouter
  .route("/collection/list")
  .get(sanitize(), websiteController.collectionList);
websiteRouter.route("/flash-sale").get(sanitize(), websiteController.flashSale);
websiteRouter.route("/area/list").post(sanitize(), websiteController.areaList);
websiteRouter
  .route("/brand-list")
  .get(sanitize(), websiteController.getAllBrandList);
