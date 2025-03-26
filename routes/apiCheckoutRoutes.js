import express from "express";
import {
  handleGuestCheckout,
  processMockPayment,
  placeOrder,
} from "../controllers/checkoutController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// ✅ Step 2: Save guest shipping info
router.post("/guest", handleGuestCheckout);

// ✅ Step 3: Mock payment
router.post("/payment", processMockPayment);

// ✅ Step 4: Place order (requires cart, guest, payment)
router.post("/place-order", placeOrder);

// ✅ Optional: Authenticated user checkout (if needed)
router.post("/", verifyToken, placeOrder);

export default router;
