import passport from "passport";
import { Strategy as JwtStrategy } from "passport-jwt";
import { Strategy as LocalStrategy } from "passport-local";
const { Op } = require("sequelize");
import bcrypt from "bcrypt-nodejs";

import config from "./config";
import { db } from "./models";
const GoogleStrategy = require("passport-google-oauth20").Strategy;
var TokenExtractor = function (req) {
  var token = null;
  if (req && req.cookies) {
    token = req.cookies["XSRF-token"];
  }
  if (!token && req.headers["authorization"]) {
    token = req.headers["authorization"];
  }
  return token;
};

passport.use(
  "user-jwt",
  new JwtStrategy(
    {
      jwtFromRequest: TokenExtractor,
      secretOrKey: config.app.secret,
    },
    async (payload, done) => {
      try {
        var user = await db.user.findOne({ where: { id: payload.sub } });
        if (new Date(payload.exp) < new Date()) {
          return done("expired", false);
        }
        if (!user) {
          return done("user", false);
        }
        done(null, user);
      } catch (error) {
        done(error, false);
      }
    }
  )
);

passport.use(
  "user-local",
  new LocalStrategy(
    {
      usernameField: "email",
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      try {
        const user = await db.user.findOne({
          where: {
            email: email,
            verify: true,
            [Op.or]: [{ role: "admin" }, { role: "emp" }],
          },
        });
        if (!user) {
          return done(null, false);
        }

        if (user.status == "inactive") {
          return done("invalid", false);
        }

        if (user.attempt == 5) {
          return done("attempt", false);
        }

        var isMatch = bcrypt.compareSync(password, user.password);

        if (!isMatch) {
          user.update({
            attempt: user.attempt + 1,
          });
          return done("attempt:" + (5 - user.attempt), false);
        } else {
          user.update({ attempt: 0 });
        }
        done(null, user);
      } catch (error) {
        console.log(error);
        done(error, false);
      }
    }
  )
);

passport.use(
  "seller-local",
  new LocalStrategy(
    {
      usernameField: "email",
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      try {
        const user = await db.user.findOne({
          where: {
            verify: true,
            email: email,
            role: req.body.role,
          },
        });
        if (!user) {
          return done(null, false);
        }

        if (user.status == "inactive") {
          return done("invalid", false);
        }
        if (!user.verify) {
          return done("invalid", false);
        }
        if (user.attempt == 5) {
          return done("attempt", false);
        }

        var isMatch = bcrypt.compareSync(password, user.password);

        if (!isMatch) {
          user.update({
            attempt: user.attempt + 1,
          });
          return done("attempt:" + (5 - user.attempt), false);
        } else {
          user.update({ attempt: 0 });
        }
        done(null, user);
      } catch (error) {
        done(error, false);
      }
    }
  )
);

passport.use(
  "customer-jwt",
  new JwtStrategy(
    {
      jwtFromRequest: TokenExtractor,
      secretOrKey: config.app.secret,
    },
    async (payload, done) => {
      try {
        var user = await db.customer.findOne({ where: { id: payload.sub } });

        if (new Date(payload.exp) < new Date()) {
          return done("expired", false);
        }

        if (!user) {
          return done("user", false);
        }
        done(null, user);
      } catch (error) {
        done(error, false);
      }
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        const [user, created] = await db.customer.findOrCreate({
          where: { email: profile.emails[0].value },
          defaults: {
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            verify: true,
          },
        });
        done(null, user);
      } catch (error) {
        console.log(error);
        done(error, false);
      }
    }
  )
);
passport.use(
  "customer-local",
  new LocalStrategy(
    {
      usernameField: "email",
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      try {
        const user = await db.customer.findOne({
          where: { email: email, role: req.body.role },
        });
        if (!user) {
          return done("Please register your email !!!", false);
        }
        if (!user.verify) {
          return done("not verified", false);
        }

        if (user.status == "inactive") {
          return done("invalid", false);
        }

        if (user.attempt == 5) {
          return done("attempt", false);
        }

        var isMatch = bcrypt.compareSync(password, user.password);

        if (!isMatch) {
          user.update({
            attempt: user.attempt + 1,
          });
          return done("attempt:" + (5 - user.attempt), false);
        } else {
          user.update({ attempt: 0 });
        }
        done(null, user);
      } catch (error) {
        console.log(error);
        done(error, false);
      }
    }
  )
);
