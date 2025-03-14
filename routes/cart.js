import express from "express";
import {
  viewCart,
  addToCart,
  removeFromCart
} from "../controllers/cartController.js";

const router = express.Router();

router.get("/", viewCart);
router.post("/add", addToCart);
router.post("/remove", removeFromCart);

export default router;
