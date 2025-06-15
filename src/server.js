import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import googleOauthRoutes from "./routes/googleOathRoutes.js";
import verifyToken from "./middlewares/verifyJWT.js";

const app = express();

// Middleware
app.use(cookieParser());

// Routes
// Home or login page
app.get("/", (req, res) => {
  res.send(`
            <h1>My App</h1>
            <p>Hello!</p>
            <a href="/dashboard">Go to Dashboard</a><br>
            <br/>
            <a href="/auth/google/register">Sign In with Google</a>
          `);
});

app.get("/dashboard", verifyToken, (req, res) => {
  res.send(`
            <h1>My App</h1>
            <p>Hello ${req.user.email}</p>
            <br/>
            <a href="/">back to Home</a><br>
          `);
});

app.use("/auth/google", googleOauthRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
