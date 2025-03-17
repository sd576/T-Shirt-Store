import express from "express";
import {
  showCheckoutPage,
  processCheckout,
  showCheckoutSuccess,
} from "../controllers/checkoutController.js";

const router = express.Router();

// GET Checkout Page → Calls the controller
router.get("/", showCheckoutPage);

// POST Checkout (submitting the form)
router.post("/", processCheckout);

// GET Checkout Success Page
router.get("/success", showCheckoutSuccess);

export default router;
