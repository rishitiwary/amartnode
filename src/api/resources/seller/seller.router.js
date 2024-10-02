import express from "express";
import sellerController from "./seller.controller";
import { sanitize } from "../../../middleware/sanitizer";
import { jwtStrategy } from "../../../middleware/strategy";
import upload from "../../../awsbucket";

import { validateBody, schemas } from "../../../middleware/validator";
export const sellerRouter = express.Router();

sellerRouter
  .route("/product/create")
  .post(sanitize(), jwtStrategy, sellerController.createProduct);
sellerRouter
  .route("/product/update")
  .put(sanitize(), jwtStrategy, sellerController.updateProduct);
sellerRouter
  .route("/product/list")
  .post(jwtStrategy, sellerController.getAllProduct);
sellerRouter
  .route("/product/list-by-id")
  .post(jwtStrategy, sellerController.getPrductById);
sellerRouter
  .route("/admin/product/search")
  .get(jwtStrategy, sellerController.sellerImageDetailByid);
sellerRouter
  .route("/image/single-upload")
  .put(
    jwtStrategy,
    upload.single("thumbnail"),
    sellerController.uploadSingleImage
  );
sellerRouter
  .route("/image/delete")
  .put(jwtStrategy, sellerController.deleteThumbnail);
sellerRouter
  .route("/dasbhoard/list")
  .get(jwtStrategy, sellerController.dashboardList);
sellerRouter
  .route("/child-category")
  .get(jwtStrategy, sellerController.childCategoryDetail);
sellerRouter
  .route("/product/update-by-category")
  .put(jwtStrategy, sellerController.updateProductByCategory);

sellerRouter
  .route("/product/getAllList")
  .get(jwtStrategy, sellerController.getAllList);

sellerRouter
  .route("/coupon/create")
  .post(
    sanitize(),
    jwtStrategy,
    validateBody(schemas.coupon),
    sellerController.couponCreate
  );
sellerRouter
  .route("/coupon/list")
  .get(sanitize(), jwtStrategy, sellerController.couponList);
sellerRouter
  .route("/coupon")
  .delete(sanitize(), jwtStrategy, sellerController.couponDelete);
sellerRouter
  .route("/brand/list")
  .get(sanitize(), jwtStrategy, sellerController.getAllBrandList);
sellerRouter
  .route("/processor-list")
  .get(sanitize(), jwtStrategy, sellerController.getProcessorList);
sellerRouter
  .route("/all-product-list")
  .get(sanitize(), sellerController.getAllProductList);
sellerRouter
  .route("/admin/product/update")
  .put(sanitize(), jwtStrategy, sellerController.sellerProductUpdate);
sellerRouter
  .route("/brand/product/price")
  .put(sanitize(), jwtStrategy, sellerController.updatePriceByBrand);
sellerRouter
  .route("/history-product")
  .get(sanitize(), jwtStrategy, sellerController.historyProduct);
sellerRouter
  .route("/common-name")
  .put(sanitize(), jwtStrategy, sellerController.CommonName);

sellerRouter
  .route("/order")
  .post(sanitize(), jwtStrategy, sellerController.getAllOrderList);
