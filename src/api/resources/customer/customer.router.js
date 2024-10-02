import express from "express";
import customerController from "./customer.controller";
import { sanitize } from "../../../middleware/sanitizer";
import {
  localCustomerStrategy,
  jwtCustomerStrategy,
  googleLoginStrategy,
  googleLoginWithIdTokenStrategy,
  googleLoginCallbackStrategy,
  firebaseLoginWithIdTokenStrategy,
} from "../../../middleware/strategy";

import { validateBody, schemas } from "../../../middleware/validator";
export const customerRouter = express.Router();
customerRouter.route("/register").post(sanitize(), customerController.addUser);
customerRouter
  .route("/getUserByEmailId")
  .get(sanitize(), jwtCustomerStrategy, customerController.findUser);
customerRouter
  .route("/rootLogin")
  .post(
    sanitize(),
    validateBody(schemas.customerLoginSchema),
    localCustomerStrategy,
    customerController.login
  );
customerRouter
  .route("/rootCheck")
  .post(
    sanitize(),
    validateBody(schemas.userCheckSchema),
    customerController.rootUserCheck
  );
customerRouter
  .route("/sendReset")
  .post(
    sanitize(),
    validateBody(schemas.sendResetPassword),
    customerController.sendReset
  );
customerRouter
  .route("/forget-password")
  .post(
    sanitize(),
    validateBody(schemas.sendResetPassword),
    customerController.forgetPassword
  );
customerRouter
  .route("/reset")
  .post(
    sanitize(),
    validateBody(schemas.resetPassword),
    customerController.resetPassword
  );
customerRouter
  .route("/reset-password")
  .post(sanitize(), customerController.customerPasswordReset);
customerRouter
  .route("/email-verify")
  .post(
    sanitize(),
    validateBody(schemas.emailVerify),
    customerController.emailVerify
  );
customerRouter.get("/google", googleLoginStrategy);

customerRouter.get(
  "/google/callback",
  googleLoginCallbackStrategy,
  customerController.googleLogin
);

customerRouter.post(
  "/googleLoginIdToken",
  googleLoginWithIdTokenStrategy,
  customerController.login
);
customerRouter.post(
  "/phoneLogin",
  firebaseLoginWithIdTokenStrategy,
  customerController.login
);
// get all customer
customerRouter
  .route("/list")
  .post(sanitize(), customerController.getAllCustomer);
customerRouter
  .route("/update")
  .post(sanitize(), jwtCustomerStrategy, customerController.getCustomerUpdate);
customerRouter
  .route("/delete")
  .delete(sanitize(), customerController.deleteCustomer);
customerRouter
  .route("/add-new-address")
  .post(sanitize(), jwtCustomerStrategy, customerController.addNewAddress);
customerRouter
  .route("/delete-address")
  .post(sanitize(), jwtCustomerStrategy, customerController.deleteAddress);
