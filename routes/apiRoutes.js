import express from "express";
import dbPromise from "../database/db.js";

const router = express.Router();

/**
 * @route GET /api/products
 * @desc  Fetch all products
 * @access Public
 */
router.get("/products", async (req, res) => {
  try {
    const db = await dbPromise;
    const products = await db.all("SELECT * FROM products");

    res.json(products);
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @route GET /api/products/:id/stock
 * @desc  Fetch stock info for a specific product by ID
 * @access Public
 */
router.get("/products/:id/stock", async (req, res) => {
  const productId = parseInt(req.params.id, 10);

  if (isNaN(productId)) {
    return res.status(400).json({ error: "Invalid product ID" });
  }

  try {
    const db = await dbPromise;

    const product = await db.get(
      "SELECT id, name FROM products WHERE id = ?",
      productId,
    );

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const stock = await db.all(
      "SELECT size, quantity FROM product_stock WHERE product_id = ?",
      productId,
    );

    res.json({
      productId: product.id,
      productName: product.name,
      stock,
    });
  } catch (error) {
    console.error(
      `❌ Error fetching stock for product ID ${productId}:`,
      error,
    );
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
