import express from "express";
import seoController from "./seo.controller";
import { sanitize } from "../../../middleware/sanitizer";

export const seoRouter = express.Router();
seoRouter.route("/list").post(sanitize(), seoController.seoList);
seoRouter.route("/update").post(sanitize(), seoController.seoUpdate);
seoRouter.route("/delete").post(sanitize(), seoController.seoDelete);
