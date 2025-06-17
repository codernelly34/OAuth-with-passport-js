import passport from "passport";
import UsersDB from "../db/usersDB.js";
import { Router } from "express";
import issueAuthToken from "../utils/issueAuthToken.js";
import { Strategy as GitHubStrategy } from "passport-github";
import { capitalize } from "../utils/utilsFun.js";

const githubOauthRoutes = Router();

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_APP_CLIENT_ID,
      clientSecret: process.env.GITHUB_APP_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_APP_REDIRECT_URI,
    },
    (accessToken, refreshToken, profile, done) => {
      const user = UsersDB.find((user) => user.email === profile._json.email);
      if (!user) {
        const newUser = {
          name: profile._json.name,
          given_name: profile._json.name.split(" ")[0],
          family_name: profile._json.name.split(" ")[1],
          email: profile._json.email,
        };

        UsersDB.push(newUser);
        return done(null, newUser);
      }

      if (user && user.provider !== "github") {
        // If user exists but provider is not github, reject login
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

// 👇 Trigger Github OAuth consent screen
githubOauthRoutes.get("/register", passport.authenticate("github"));

// 👇 Github callback
githubOauthRoutes.get("/redirect", (req, res, next) => {
  passport.authenticate("github", async (err, user, info) => {
    if (err) {
      return res.status(400).send({ error: err.message });
    }

    issueAuthToken(user, res);

    res.redirect("/dashboard");
  })(req, res, next);
});

export default githubOauthRoutes;
