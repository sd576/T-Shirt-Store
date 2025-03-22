import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const verifyToken = (req, res, next) => {
  console.log("✅ verifyToken middleware hit");

  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    console.log("❌ No Authorization header provided");
    return res.status(401).json({ success: false, error: "No token provided" });
  }

  const tokenParts = authHeader.split(" ");

  if (tokenParts[0] !== "Bearer" || !tokenParts[1]) {
    console.log("❌ Invalid Authorization header format");
    return res.status(401).json({ success: false, error: "Invalid Authorization header format" });
  }

  const token = tokenParts[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("❌ Token verification failed", err.message);

      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ success: false, error: "Token expired" });
      }

      return res.status(403).json({ success: false, error: "Invalid token" });
    }

    console.log("✅ Token verified", decoded);
    req.user = decoded;
    next();
  });
};

export default verifyToken;
