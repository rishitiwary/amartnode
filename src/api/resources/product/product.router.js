import express from "express";
import productController from "./product.controller";
import { jwtStrategy } from "../../../middleware/strategy";
import { sanitize } from "../../../middleware/sanitizer";
import upload from "../../../awsbucket";

export const productRouter = express.Router();
productRouter
  .route("/add")
  .post(
    sanitize(),
    jwtStrategy,
    upload.single("photo"),
    productController.addProduct
  );
productRouter.route("/getAllproduct").get(sanitize(), productController.index);
productRouter
  .route("/getAllproductList")
  .post(sanitize(), jwtStrategy, productController.getAllProductList);
productRouter
  .route("/search/getAllproductList")
  .get(sanitize(), jwtStrategy, productController.searchAllProductList);
productRouter
  .route("/update")
  .post(
    sanitize(),
    jwtStrategy,
    upload.single("photo"),
    productController.update
  );
productRouter
  .route("/getProductByCategory")
  .get(sanitize(), productController.getProductListByCategory);
productRouter
  .route("/getProductById")
  .get(sanitize(), productController.getProductListById);
productRouter
  .route("/getWebProductById")
  .post(sanitize(), productController.getWebProductListById);
productRouter
  .route("/product-offer")
  .post(sanitize(), productController.addProductOffer);
productRouter
  .route("/getAllProductOffer")
  .get(sanitize(), productController.getProductOffer);
productRouter
  .route("/delete")
  .delete(sanitize(), jwtStrategy, productController.productDelete);
productRouter
  .route("/deleteOfferById/:id")
  .get(sanitize(), jwtStrategy, productController.productOfferDelete);
productRouter
  .route("/upload-img")
  .post(
    sanitize(),
    jwtStrategy,
    upload.array("file", 10),
    productController.multiplePhotoUpload
  );
productRouter
  .route("/upload/varient-img")
  .post(
    sanitize(),
    jwtStrategy,
    upload.array("file", 10),
    productController.varientImageUpload
  );
productRouter
  .route("/getAllPhoto")
  .post(sanitize(), productController.getAllPhoto);
productRouter
  .route("/getAllPhotoById")
  .post(sanitize(), productController.getAllPhotoById);
productRouter
  .route("/slider-photo/delete")
  .delete(sanitize(), jwtStrategy, productController.deleteSliderPhoto);
productRouter
  .route("/varients-delete")
  .delete(sanitize(), jwtStrategy, productController.productVarients);
productRouter
  .route("/main-delete")
  .delete(sanitize(), jwtStrategy, productController.deleteMainProduct);
productRouter
  .route("/new-arrival")
  .get(sanitize(), productController.newArrivalProduct);

//Category by product
productRouter
  .route("/getAllGroceryStaple")
  .get(sanitize(), productController.getAllGrocerryStaples);
productRouter
  .route("/list")
  .post(sanitize(), productController.getAllProductBySlug);
productRouter
  .route("/getAllByCategory")
  .post(sanitize(), productController.GetAllByCategory);

//Personal care
productRouter
  .route("/getAllPersonalCare")
  .get(sanitize(), productController.getAllPersonalCare);
productRouter
  .route("/getAllHomeKitchen")
  .get(sanitize(), productController.getAllHomeKitchen);

// Filter product
productRouter
  .route("/gcatalogsearch/result")
  .get(sanitize(), productController.getFilterbyProduct);
productRouter
  .route("/filtersortby")
  .post(sanitize(), productController.filtershortby);

// status update
productRouter
  .route("/status/update")
  .post(sanitize(), jwtStrategy, productController.statusUpdate);
productRouter
  .route("/update-stock")
  .post(sanitize(), jwtStrategy, productController.stockUpdate);

//aws image delete
productRouter
  .route("/banner-upload")
  .post(
    sanitize(),
    jwtStrategy,
    upload.single("banner"),
    productController.bannerUpload
  );
productRouter
  .route("/admin/banner-list")
  .get(sanitize(), jwtStrategy, productController.bannerAdminList);
productRouter
  .route("/banner-list")
  .get(sanitize(), productController.bannerList);

productRouter
  .route("/banner-status")
  .post(sanitize(), jwtStrategy, productController.bannerStatus);

productRouter
  .route("/aws/delete/photo")
  .post(sanitize(), jwtStrategy, productController.awsProductPhotoDelete);
productRouter
  .route("/website/relatedProduct")
  .post(sanitize(), productController.relatedProduct);
productRouter
  .route("/banner-delete")
  .post(sanitize(), jwtStrategy, productController.bannerListDelete);

//seo details
productRouter
  .route("/seo-create")
  .post(jwtStrategy, productController.seoDetailsList);

//brand details
productRouter
  .route("/brand-create")
  .post(sanitize(), jwtStrategy, productController.createBrandDetails);
productRouter
  .route("/brand-list")
  .post(sanitize(), productController.getAllBrandList);
productRouter
  .route("/brand-update")
  .post(
    sanitize(),
    jwtStrategy,
    upload.single("thumbnail"),
    productController.updateBrandDetails
  );
productRouter
  .route("/brand-delete")
  .post(sanitize(), jwtStrategy, productController.brandListDelete);

// color
productRouter
  .route("/color/create")
  .post(
    sanitize(),
    upload.single("thumbnail"),
    jwtStrategy,
    productController.createColorDetails
  );
productRouter
  .route("/color-update")
  .post(
    sanitize(),
    upload.single("thumbnail"),
    jwtStrategy,
    productController.updateColorDetails
  );
productRouter
  .route("/color/list")
  .post(sanitize(), jwtStrategy, productController.getColorList);
productRouter
  .route("/color/delete")
  .delete(sanitize(), jwtStrategy, productController.deleteColorById);

// color details
productRouter
  .route("/color/list")
  .get(sanitize(), jwtStrategy, productController.productColourList);
productRouter
  .route("/getAllList")
  .get(sanitize(), jwtStrategy, productController.getProductForFlash);
productRouter
  .route("/tag")
  .get(sanitize(), jwtStrategy, productController.getTag);
productRouter
  .route("/tag")
  .delete(sanitize(), jwtStrategy, productController.getDeleteTag);

// processor
productRouter
  .route("/processor-create")
  .post(sanitize(), jwtStrategy, productController.createProcessor);
productRouter
  .route("/processor-list")
  .post(sanitize(), jwtStrategy, productController.getProcessorList);
productRouter
  .route("/processor-delete")
  .delete(sanitize(), jwtStrategy, productController.deleteProcessorById);
