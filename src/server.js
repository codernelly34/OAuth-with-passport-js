import "dotenv/config";
import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import cookieParser from "cookie-parser";

const app = express();
const users = [];

// Middleware
app.use(cookieParser());
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URI,
    },
    (accessToken, refreshToken, profile, done) => {
      // Simulate user lookup or creation
      let user = users.find((u) => u.googleId === profile.id);
      if (!user) {
        user = {
          id: users.length + 1,
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
        };
        return users.push(user);
      }

      // Manually issue JWT here
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      // Pass both user and token to the next step
      done(null, { user, token });
    }
  )
);

function verifyJWT(req, res, next) {
  const { token } = req.cookies; // Bearer <token>
  if (!token) return res.status(401).json({ error: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = decoded;
    next();
  });
}

// Routes
// Home or login page
app.get("/", (req, res) => {
  res.send(`
    <h1>My App</h1>
    
      <p>Hello!</p>
      <a href="/protected">Go to Dashboard</a><br>
   
      <a href="/auth/google">Sign In with Google</a>`);
});

// 👇 Trigger Google OAuth consent screen
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// 👇 Google callback
app.get(
  "/oauth/redirect",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/",
  }),
  (req, res) => {
    // Passport's done(null, { user, token }) → req.user = { user, token }
    const { user, token } = req.user;

    res.cookie("token", token);

    res.redirect("/protected");
  }
);

// 👇 Protected route
app.get("/protected", verifyJWT, (req, res) => {
  res.json({
    message: `Welcome, user ${req.user.email}. This is protected data.`,
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
