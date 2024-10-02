import express from "express";
import authController from "./auth.controller";
import {
  sellerStrategy,
  localStrategy,
  jwtStrategy,
} from "../../../middleware/strategy";
import { sanitize } from "../../../middleware/sanitizer";
import { validateBody, schemas } from "../../../middleware/validator";

export const authRouter = express.Router();
authRouter
  .route("/register")
  .post(
    sanitize(),
    validateBody(schemas.registerSchema),
    authController.addUser
  );
authRouter
  .route("/user/getAllUserList")
  .get(sanitize(), jwtStrategy, authController.getAllUserList);
authRouter
  .route("/user/update")
  .post(sanitize(), jwtStrategy, authController.userUpdate);
authRouter
  .route("/user/delete")
  .post(sanitize(), jwtStrategy, authController.deleteUserList);
authRouter
  .route("/getUserByEmailId")
  .get(sanitize(), jwtStrategy, authController.findUser);
authRouter
  .route("/rootLogin")
  .post(
    sanitize(),
    validateBody(schemas.loginSchema),
    localStrategy,
    authController.login
  );

//seller api
authRouter
  .route("/seller/login")
  .post(
    sanitize(),
    validateBody(schemas.loginSchema),
    sellerStrategy,
    authController.sellerLogin
  );
authRouter
  .route("/seller/profile-details")
  .get(sanitize(), jwtStrategy, authController.getSellerUser);
authRouter
  .route("/seller/profile-update")
  .post(sanitize(), jwtStrategy, authController.sellerProfileUpdate);
