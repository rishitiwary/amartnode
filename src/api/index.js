import express from "express";
import { authRouter } from "./resources/auth";
import { productRouter } from "./resources/product";
import { vendorRouter } from "./resources/vendor";
import { sellerRouter } from "./resources/seller";
import { categoryRouter } from "./resources/category";
import { locationRouter } from "./resources/location";
import { customerRouter } from "./resources/customer";
import { orderRouter } from "./resources/order";
import { businessRouter } from "./resources/business";
import { seoRouter } from "./resources/seo";
import { websiteRouter } from "./resources/website";
import { collectionRouter } from "./resources/collection";
import { findVendorWithLowestPrice } from "../utils";

export const restRouter = express.Router();
restRouter.use("/auth", authRouter);
restRouter.use("/customer", customerRouter);
restRouter.use("/location", locationRouter);
restRouter.use("/product", productRouter);
restRouter.use("/vendor", vendorRouter);
restRouter.use("/seller", sellerRouter);
restRouter.use("/category", categoryRouter);
restRouter.use("/order", orderRouter);
restRouter.use("/business", businessRouter);
restRouter.use("/seo", seoRouter);
restRouter.use("/website", websiteRouter);
restRouter.use("/collection", collectionRouter);

restRouter.get("/vendorMin", function (req, res) {
  const productId = req.query.productId;
  findVendorWithLowestPrice(productId)
    .then(({ vendor }) => {
      res.status(200).send({ vendor });
    })
    .catch((err) => {
      res.status(500).send({ err });
    });
});
