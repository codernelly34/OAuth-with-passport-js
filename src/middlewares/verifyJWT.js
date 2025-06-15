import jwt from "jsonwebtoken";
function verifyToken(req, res, next) {
  const { token } = req.cookies;
  if (!token) return res.redirect("/");

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.redirect("/");
    req.user = decoded;

    next();
  });
}

export default verifyToken;
