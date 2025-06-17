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

      if (user && user.provider !== "google") {
        // If user exists but provider is not google, reject login
        return done(
          new Error(
            `This email is already registered with ${capitalize(
              user.provider
            )}. Please login using your ${capitalize(user.provider)} account.`
          ),
          null
        );
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
      return res.status(400).send({ error: err.message });
    }

    issueAuthToken(user, res);

    res.redirect("/dashboard");
  })(req, res, next);
});

export default googleOauthRoutes;
