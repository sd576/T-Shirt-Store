import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const verifyToken = (req, res, next) => {
  console.log("✅ verifyToken middleware hit");

  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    console.log("❌ No Authorization header provided");
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    console.log("❌ Token missing after split");
    return res.status(401).json({ message: "Token missing" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("❌ Invalid token");
      return res.status(403).json({ message: "Invalid token" });
    }

    console.log("✅ Token verified", decoded);
    req.user = decoded;
    next();
  });
};

export default verifyToken;
