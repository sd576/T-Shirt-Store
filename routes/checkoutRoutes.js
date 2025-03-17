import express from "express";
import {
  showCheckoutPage,
  processCheckout,
  showCheckoutSuccess,
} from "../controllers/checkoutController.js";

const router = express.Router();

router.get("/", showCheckoutPage);
router.post("/", processCheckout);
router.get("/success", showCheckoutSuccess);

export default router;
