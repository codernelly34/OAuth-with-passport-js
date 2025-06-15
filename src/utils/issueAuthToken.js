import jwt from "jsonwebtoken";
import ms from "ms";

const expiresDate = ms("15m");

function issueAuthToken(user, res) {
  // Create access and refresh token
  const createAccessToken = jwt.sign(
    { email: user.email },
    process.env.JWT_SECRET,
    {
      expiresIn: expiresDate,
    }
  );

  // Set access and refresh tokens as secure, HTTP-only cookies with expiration times
  res.cookie("token", createAccessToken, {
    maxAge: expiresDate,
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
}

export default issueAuthToken;
