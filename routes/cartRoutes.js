import express from "express";
import {
  viewCart,
  addToCart,
  removeFromCart,
  updateCart,
} from "../controllers/cartController.js";

const router = express.Router();

// GET /cart → Show the cart page
router.get("/", viewCart);

// POST /cart/add → Add item to cart
router.post("/add", addToCart);

// POST /cart/remove → Remove item from cart
router.post("/remove", removeFromCart);

// POST /cart/update → Update quantities
router.post("/update", updateCart);

export default router;
