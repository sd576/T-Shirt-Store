import express from "express";
const router = express.Router();

import products from "../data/productSeedData.js";

// GET /api/products/:id → Get full product info by ID
router.get("/products/:id", (req, res) => {
  const productId = parseInt(req.params.id);
  const product = products.find((p) => p.id === productId);

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  // Format response for consistency
  const formatted = {
    id: product.id,
    name: product.name,
    sizes: product.sizes.map((size) => ({
      size,
      stock: product.stock[size],
    })),
  };

  res.json(formatted);
});

export default router;
