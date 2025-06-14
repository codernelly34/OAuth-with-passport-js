import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import UsersDB from "../db/usersDB.js";
import { Router } from "express";

const googleOauthRoutes = Router();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URI,
    },
    (accessToken, refreshToken, profile, done) => {}
  )
);

// Routes

// 👇 Trigger Google OAuth consent screen
googleOauthRoutes.get(
  "/register",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// 👇 Google callback
googleOauthRoutes.get("/redirect", (req, res, next) => {
  passport.authenticate("google", async (err, user, info) => {
    if (err) {
      return res.status(500).json({ err });
    }
  })(req, res, next);
});

export default googleOauthRoutes;
