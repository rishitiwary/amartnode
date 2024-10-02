import express from "express";
import collectionController from "./collection.controller";
import { sanitize } from "../../../middleware/sanitizer";
import { jwtStrategy } from "../../../middleware/strategy";
import upload from "../../../awsbucket";

export const collectionRouter = express.Router();
collectionRouter
  .route("/create")
  .post(sanitize(), jwtStrategy, collectionController.create);
collectionRouter
  .route("/list")
  .get(sanitize(), jwtStrategy, collectionController.getList);
collectionRouter
  .route("/update")
  .put(sanitize(), jwtStrategy, collectionController.update);

collectionRouter
  .route("/item")
  .post(
    sanitize(),
    jwtStrategy,
    upload.single("thumbnail"),
    collectionController.itemCreate
  );
collectionRouter
  .route("/item/list")
  .get(sanitize(), jwtStrategy, collectionController.getItem);
collectionRouter
  .route("/item/delete")
  .post(sanitize(), jwtStrategy, collectionController.deleteItem);
collectionRouter
  .route("/flash-sale")
  .post(
    sanitize(),
    jwtStrategy,
    upload.single("thumbnail"),
    collectionController.flashSaleCreate
  );
collectionRouter
  .route("/flash-sale-list")
  .get(sanitize(), jwtStrategy, collectionController.getFlashSaleList);
collectionRouter
  .route("/flash-sale-delete")
  .delete(sanitize(), jwtStrategy, collectionController.deleteProductFromFlash);
collectionRouter
  .route("/flash-sale-update")
  .put(
    sanitize(),
    jwtStrategy,
    upload.single("thumbnail"),
    collectionController.flashSaleUpdate
  );
collectionRouter
  .route("/flash-sale-status-update")
  .put(sanitize(), jwtStrategy, collectionController.flashSaleStatusUpdate);
