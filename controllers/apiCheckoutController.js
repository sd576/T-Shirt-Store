import express from "express";
import { placeOrder } from "../controllers/apiCheckoutController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// Guest checkout (no token required)
router.post("/guest", placeOrder);

// Logged-in checkout (requires JWT)
router.post("/", verifyToken, placeOrder);

export default router;
