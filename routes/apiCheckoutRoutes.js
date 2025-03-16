import express from "express";
import { placeOrder } from "../controllers/checkoutController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// ✅ Guest checkout route (no token required)
router.post("/guest", placeOrder);

// ✅ Logged-in user checkout route (JWT protected)
router.post("/", verifyToken, placeOrder);

export default router;
