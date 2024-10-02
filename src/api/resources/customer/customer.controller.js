import { db } from "../../../models";
import JWT from "jsonwebtoken";
import mailer from "../../../mailer";
import config from "../../../config";
import bcrypt from "bcrypt-nodejs";
import speakeasy from "speakeasy";
import { validateEmail } from "./../../../functions";
const Util = require("../../../helpers/Util");

var JWTSign = function (user, date) {
  return JWT.sign(
    {
      iss: config.app.name,
      sub: user.id,
      iam: user.type,
      iat: date.getTime(),
      exp: new Date().setDate(date.getDate() + 2),
    },
    config.app.secret
  );
};

function generateOtp() {
  let token = speakeasy.totp({
    secret: process.env.OTP_KEY,
    encoding: "base32",
    step: 30 - Math.floor((new Date().getTime() / 1000.0) % 30),
  });
  return token;
}

function verifyOtp(token) {
  let expiry = speakeasy.totp.verify({
    secret: process.env.OTP_KEY,
    encoding: "base32",
    token: token,
    step: 30 - Math.floor((new Date().getTime() / 1000.0) % 30),
    window: 0,
  });
  return expiry;
}

export default {
  async addUser(req, res, next) {
    const {
      firstName,
      lastName,
      gender,
      phone,
      email,
      address,
      password,
      role,
    } = req.body;
    let passwordHash = bcrypt.hashSync(password);
    let key = Math.random().toString(36).slice(2);
    let otp = generateOtp();
    // let token = verifyOtp(otp);

    const query = {};
    query.where = {};
    query.where.email = email;
    query.where.role = role;

    try {
      db.customer
        .findAll(query)
        .then((find) => {
          if (find && find.length) {
            throw new RequestError(
              "Email already registered please use another!",
              409
            );
          }
          return db.customer.create({
            firstName: firstName,
            lastName: lastName,
            email: email.toLowerCase().trim().replace(/\s/g, ""),
            gender: gender,
            phone: phone,
            role: role,
            address: address,
            password: passwordHash,
            verf_key: otp,
          });
        })
        .then((user) => {
          if (user) {
            try {
              return mailer.sendOtp(email, key, otp);
            } catch (error) {
              next(error);
            }
          } else
            res
              .status(500)
              .json({ message: "email sent failed", success: false });
        })
        .then((list) => {
          let response = Util.getFormatedResponse(false, {
            message: "Success",
          });
          res.status(response.code).json(response);
        })
        .catch((err) => {
          next(err);
        });
    } catch (error) {
      next(error);
    }
  },

  async findUser(req, res, next) {
    db.customer
      .findOne({
        attributes: [
          "id",
          "email",
          "firstName",
          "gender",
          "lastName",
          "phone",
          "role",
        ],
        where: { email: req.user.email, role: req.user.role },
        paranoid: false,
        include: [{ model: db.Address }],
      })
      .then((user) => {
        if (user) {
          let response = Util.getFormatedResponse(false, user, {
            message: "success",
          });
          res.status(response.code).json(response);
        } else {
          let response = Util.getFormatedResponse(false, {
            message: "Not found data",
          });
          res.status(response.code).json(response);
        }
      })
      .catch((err) => {
        next(err);
      });
  },
  async googleLogin(req, res, next) {
    var date = new Date();
    var token = JWTSign(req.user, date);
    res.cookie("XSRF-token", token, {
      expire: new Date().setDate(date.getDate() + 2),
      httpOnly: true,
      secure: config.app.secure,
    });

    return res.redirect(
      req.query.state + `?email=${req.user.email}&token=${token}`
    );
  },
  async login(req, res, next) {
    var date = new Date();
    var token = JWTSign(req.user, date);
    res.cookie("XSRF-token", token, {
      expire: new Date().setDate(date.getDate() + 2),
      httpOnly: true,
      secure: config.app.secure,
    });

    return res
      .status(200)
      .json({ success: true, token, email: req.user.email });
  },

  async rootUserCheck(req, res) {
    if (validateEmail(req.body.email)) {
      db.user
        .findOne({
          where: {
            email: req.body.email,
          },
        })
        .then((user) => {
          if (user)
            return res.status(200).json({
              success: true,
              redirect: false,
              email: req.body.email,
            });
          return res.status(401).json({
            success: false,
            redirect: false,
            msg: "Jankpur Grocerry account with that sign-in information does not exist. Try again or create a new account.",
          });
        });
    }
  },

  async sendReset(req, res, next) {
    const { email, role } = req.body;
    db.customer
      .findOne({
        where: { email: email, role: role },
      })
      .then((email) => {
        if (email && email.id) {
          mailer
            .sendResetPassword(email, role)
            .then((r) => {
              return res.status(200).json({ success: true });
            })
            .catch((err) => {
              next(err);
            });
        } else {
          throw new RequestError("Email is not found", 404);
        }
      })
      .catch((err) => {
        next(err);
      });
  },
  async forgetPassword(req, res, next) {
    const { email, role } = req.body;
    let key = Math.random().toString(36).slice(2);
    let otp = generateOtp();
    db.customer
      .findOne({
        where: { email: email, role: role },
        attributes: ["id", "email", "verify"],
      })
      .then(async (list) => {
        const t = await db.sequelize.transaction();
        try {
          if (list && list.id) {
            await db.customer.update(
              {
                verf_key: otp,
              },
              { where: { id: list.id }, transaction: t }
            );
            return t.commit();
          } else {
            throw new RequestError("Email is not found", 404);
          }
        } catch (err) {
          // If the execution reaches this line, an error was thrown.
          await t.rollback();
          throw error;
        }
      })
      .then((list) => {
        try {
          const emailInfo = mailer.sendResetPassword(email, key, otp);
          const userInfo = {
            email: email,
            message: "Otp send your registered email",
          };
          let response = Util.getFormatedResponse(false, userInfo, {
            message: "Otp send your registered email",
          });
          res.status(response.code).json(response);
        } catch (error) {
          throw error;
        }
      })
      .catch((err) => {
        next(err);
      });
  },
  async resetPassword(req, res) {
    const { email, key, password } = req.body;
    db.customer
      .findOne({
        where: { email: email, verf_key: key },
      })
      .then((result) => {
        if (result) {
          var hash = bcrypt.hashSync(password);
          db.customer.update(
            { password: hash, verify: 1 },
            { where: { email: email } }
          );
          return res.status(200).json({ success: true });
        } else {
          return res
            .status(500)
            .json({ errors: ["Invalid verification code!"] });
        }
      })
      .catch((err) => {
        return res.status(500).json({ errors: ["Error Updating Password!"] });
      });
  },
  async customerPasswordReset(req, res) {
    const { email, role, password, OTP } = req.body;
    db.customer
      .findOne({
        where: { email: email, role: role, verf_key: OTP },
      })
      .then((result) => {
        if (result) {
          var hash = bcrypt.hashSync(password);
          db.customer.update(
            { password: hash, verify: 1 },
            { where: { email: email } }
          );
          let response = Util.getFormatedResponse(false, {
            message: "Success",
          });
          res.status(response.code).json(response);
        } else {
          return res.status(500).json({ errors: ["Invalid OTP Number!!"] });
        }
      })
      .catch((err) => {
        next(err);
      });
  },
  async emailVerify(req, res) {
    const { email, key } = req.body;
    db.customer
      .findOne({
        where: { email: email, verf_key: key },
      })
      .then((result) => {
        if (result) {
          db.customer.update(
            { verify: 1 },
            { where: { email: email, verf_key: key } }
          );
          let response = Util.getFormatedResponse(false, {
            message: "Success",
          });
          res.status(response.code).json(response);
        } else {
          return res.status(500).json({ errors: ["Invalid OTP"] });
        }
      })
      .catch((err) => {
        return res.status(500).json({ errors: ["Error email verification"] });
      });
  },

  async getAllCustomer(req, res, next) {
    let limit = 10;
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
      db.customer
        .count()
        .then((count) => {
          let pages = Math.ceil(count / limit);
          offset = limit * (page - 1);
          return db.customer
            .findAll({
              order: [["createdAt", "DESC"]],
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
    // db.customer.findAll()
    //     .then(user => {
    //         if (user) {
    //             return res.status(200).json({ success: true, data: user });
    //         }
    //         else
    //             res.status(500).json({ 'success': false });
    //     })
    //     .catch(err => {
    //         console.log(err)
    //         next(err);
    //     })
  },

  async deleteCustomer(req, res, next) {
    try {
      db.customer
        .findOne({ where: { id: parseInt(req.query.id) } })
        .then((customer) => {
          if (customer) {
            return db.customer.destroy({ where: { id: customer.id } });
          }
          throw new RequestError("Customer is not found");
        })
        .then((re) => {
          return res
            .status(200)
            .json({ msg: "success", status: "deleted Customer Seccessfully" });
        })
        .catch((err) => {
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  //Api customer update
  async getCustomerUpdate(req, res, next) {
    try {
      const { firstName, lastName, phone, gender, address } = req.body;
      db.customer
        .findOne({ where: { id: req.user.id, role: req.user.role } })
        .then((customer) => {
          if (customer) {
            return db.customer.update(
              {
                firstName: firstName,
                lastName: lastName,
                phone: phone,
                gender: gender,
                address: address,
              },
              { where: { id: req.user.id } }
            );
          }
          throw new RequestError("Customer is not found");
        })
        .then((re) => {
          return res
            .status(200)
            .json({ success: true, message: "Updated successfully" });
        })
        .catch((err) => {
          next(err);
        });
    } catch (err) {
      throw new RequestError(err);
    }
  },

  async addNewAddress(req, res, next) {
    try {
      const { address } = req.body;
      db.customer
        .findOne({ where: { id: req.user.id, email: req.user.email } })
        .then((customer) => {
          return db.Address.create({
            custId: req.user.id,
            shipping: address,
          });
        })
        .then((re) => {
          return res
            .status(200)
            .json({ msg: "success", msg: " successfully inserted" });
        })
        .catch((err) => {
          console.log(err);
          next(err);
        });
    } catch (err) {
      console.log(err);
      throw new RequestError("Error");
    }
  },

  async deleteAddress(req, res, next) {
    try {
      db.Address.findOne({ where: { id: req.body.id } })
        .then((customer) => {
          return db.Address.destroy({ where: { id: customer.id } });
        })
        .then((re) => {
          return res
            .status(200)
            .json({ msg: "success", msg: "Deleted Successfully" });
        })
        .catch((err) => {
          console.log(err);
          next(err);
        });
    } catch (err) {
      console.log(err);
      throw new RequestError("Error");
    }
  },
};
