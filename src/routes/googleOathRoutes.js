import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import UsersDB from "../db/usersDB.js";
import { Router } from "express";
import issueAuthToken from "../utils/issueAuthToken.js";

const googleOauthRoutes = Router();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URI,
    },
    (accessToken, refreshToken, profile, done) => {
      const user = UsersDB.find((user) => user.email === profile._json.email);
      if (!user) {
        const newUser = {
          name: profile._json.name,
          given_name: profile._json.given_name,
          family_name: profile._json.family_name,
          email: profile._json.email,
        };

        UsersDB.push(newUser);
        return done(null, newUser);
      }
      done(null, user);
    }
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
      return res.redirect("/");
    }

    issueAuthToken(user, res);

    res.redirect("/dashboard");
  })(req, res, next);
});

export default googleOauthRoutes;
