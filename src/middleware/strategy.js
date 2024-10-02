import passport from "passport";
import JWT from "jsonwebtoken";
import config from "../config";
import { db } from "../models";
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID_FIREBASE);
const admin = require("firebase-admin");

const serviceAccount = require("../serviceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    // audience:,  // Specify the CLIENT_ID of the app that accesses the backend
    // Or, if multiple clients access the backend:
    //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();
  // const email = payload['email'];
  return payload;
  // If request specified a G Suite domain:
  // const domain = payload['hd'];
}
var JWTSign = function (iss, user, date) {
  return JWT.sign(
    {
      iss: iss,
      sub: user.id,
      iam: user.type,
      iat: date.getTime(),
      exp: new Date().setMinutes(date.getMinutes() + 30),
    },
    config.app.secret
  );
};

export const googleLoginStrategy = (req, res, next) => {
  // console.log(req.query)
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: req.query.callbackURL,
  })(req, res, next);
};
export const googleLoginCallbackStrategy = (req, res, next) => {
  // console.log(req,res)
  passport.authenticate(
    "google",
    { failureRedirect: "/login" },
    function (err, user) {
      if (err && Object.keys(err).length) {
        return res.status(500).json({ errors: [err] });
      }
      // console.log({req.message,res});
      req.user = user;
      next();
    }
  )(req, res, next);
};
export const firebaseLoginWithIdTokenStrategy = async (req, res, next) => {
  try {
    const payload = await admin.auth().verifyIdToken(req.body.idToken);
    const { phone_number } = payload;
    console.log({ phone_number });
    // console.log({payload})
    const [user, created] = await db.customer.findOrCreate({
      where: { phone: phone_number },
      defaults: {
        // phone:phone_number,
        //   firstName:req.body.name || given_name,
        //   lastName:family_name,
        verify: true,
        // email:email,
        firstName: req.body.name,
      },
    });
    req.user = user;
    next();
  } catch (err) {
    console.log({ err });
    return res.status(500).json({ errors: [err] });
  }
};
export const googleLoginWithIdTokenStrategy = async (req, res, next) => {
  try {
    const payload = await verify(req.body.idToken);
    const { email, family_name, given_name } = payload;
    const [user, created] = await db.customer.findOrCreate({
      where: { email: email },
      defaults: {
        firstName: req.body.name || given_name,
        lastName: family_name,
        verify: true,
      },
    });
    req.user = user;
    next();
  } catch (err) {
    console.log({ err });
    return res.status(500).json({ errors: [err] });
  }
};
export var jwtStrategy = (req, res, next) => {
  passport.authenticate("user-jwt", { session: false }, (err, user, info) => {
    let contype = req.headers["content-type"];
    var json = !(!contype || contype.indexOf("application/json") !== 0);
    if (err && err == "expired") {
      return json
        ? res.status(500).json({ errors: ["Session is expired"] })
        : res.redirect("https://admin.grozep.com/auth/login");
    }
    if (err && err == "invalid") {
      return json
        ? res.status(500).json({ errors: ["Invalid token recieved"] })
        : res.redirect("https://admin.grozep.com/auth/login");
    }
    if (err && err == "user") {
      return json
        ? res.status(500).json({ errors: ["Invalid user recieved"] })
        : res.redirect("https://admin.grozep.com/auth/login");
    }
    if (err && Object.keys(err).length) {
      return res.status(500).json({ errors: [err] });
    }
    if (err) {
      return res.status(500).json({ errors: ["Invalid user recieved"] });
    }
    if (!user) {
      return json
        ? res.status(500).json({ errors: ["Invalid user recieved"] })
        : res.redirect("/login");
    }
    req.user = user;
    next();
  })(req, res, next);
};

export var localStrategy = (req, res, next) => {
  passport.authenticate("user-local", { session: false }, (err, user, info) => {
    if (err && err == "invalid") {
      return res.status(500).json({ errors: ["Email Id not verified"] });
    }
    if (err && err == "attempt") {
      return res.status(500).json({
        errors: ["Too many invalid attempts. Please reset your password."],
      });
    }
    if (err && err.startsWith("attempt:")) {
      return res.status(500).json({
        errors: [
          "Invalid Credentials (" + err.split(":")[1] + " Attempt(s) Left)",
        ],
      });
    }
    if (err) {
      return res.status(500).json({ errors: [err] });
    }
    if (!user) {
      return res.status(500).json({ errors: ["Invalid Credentials"] });
    }
    req.user = user;
    next();
  })(req, res, next);
};

export var sellerStrategy = (req, res, next) => {
  passport.authenticate(
    "seller-local",
    { session: false },
    (err, user, info) => {
      if (err && err == "invalid") {
        return res.status(500).json({ errors: ["Email Id not verified"] });
      }
      if (err && err == "attempt") {
        return res.status(500).json({
          errors: ["Too many invalid attempts. Please reset your password."],
        });
      }
      if (err && err.startsWith("attempt:")) {
        return res.status(500).json({
          errors: [
            "Invalid Credentials (" + err.split(":")[1] + " Attempt(s) Left)",
          ],
        });
      }
      if (err) {
        return res.status(500).json({ errors: [err] });
      }
      if (!user) {
        return res.status(500).json({ errors: ["Invalid Credentials"] });
      }
      req.user = user;
      next();
    }
  )(req, res, next);
};

export var jwtCustomerStrategy = (req, res, next) => {
  passport.authenticate(
    "customer-jwt",
    { session: false },
    (err, user, info) => {
      let contype = req.headers["content-type"];
      var json = !(!contype || contype.indexOf("application/json") !== 0);
      if (err && err == "expired") {
        return res.status(401).json({ errors: ["Session is expired"] });
        /* res.redirect('/login') */ ("");
      }
      if (err && err == "invalid") {
        return res.status(401).json({ errors: ["Invalid token recieved"] });
        /* res.redirect('/login') */ ("");
      }
      if (err && err == "user") {
        return res.status(403).json({ errors: ["Invalid user recieved"] });
        /* res.redirect('https://grozep.com/login') */ ("");
      }
      if (err && Object.keys(err).length) {
        return res.status(401).json({ errors: [err] });
      }
      if (err) {
        return res.status(401).json({ errors: ["Invalid user recieved"] });
      }
      if (!user) {
        return res.status(401).json({ errors: ["Invalid user recieved"] });
        /* res.redirect('https://grozep.com/login') */ ("");
      }
      req.user = user;
      next();
    }
  )(req, res, next);
};

export var localCustomerStrategy = (req, res, next) => {
  passport.authenticate(
    "customer-local",
    { session: false },
    (err, user, info) => {
      if (err && err == "invalid") {
        return res.status(500).json({ errors: ["Email Id not verified"] });
      }
      if (err && err == "attempt") {
        return res.status(500).json({
          errors: ["Too many invalid attempts. Please reset your password."],
        });
      }
      if (err && err.startsWith("attempt:")) {
        return res.status(500).json({
          errors: [
            "Invalid Credentials (" + err.split(":")[1] + " Attempt(s) Left)",
          ],
        });
      }
      if (err) {
        return res.status(500).json({ errors: [err] });
      }
      if (!user) {
        return res.status(500).json({ errors: ["Invalid Credentials"] });
      }
      req.user = user;
      next();
    }
  )(req, res, next);
};

// const GoogleStrategy = require('passport-google-oauth20').Strategy;
