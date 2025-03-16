import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import { getUserOrders } from "../controllers/orderController.js";

const router = express.Router();

// Add log inside the route!
router.get("/", verifyToken, (req, res) => {
  console.log("✅ /api/orders route hit");
  getUserOrders(req, res);
});

export default router;
