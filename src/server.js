import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import googleOauthRoutes from "./routes/googleOathRoutes.js";

const app = express();

// Middleware
app.use(cookieParser());

// Routes
// Home or login page
app.get("/", (req, res) => {
  res.send(`
    <h1>My App</h1>
    
      <p>Hello!</p>
      <a href="/protected">Go to Dashboard</a><br>
   
      <a href="/auth/google">Sign In with Google</a>`);
});
app.use("/auth/google", googleOauthRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
