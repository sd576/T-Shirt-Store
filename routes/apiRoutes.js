// routes/apiRoutes.js
import express from "express";
import dbPromise from "../database/db.js";

// Import sub-API routers
import apiAuthRoutes from "./apiAuthRoutes.js";
import apiCartRoutes from "./apiCartRoutes.js";
import apiCheckoutRoutes from "./apiCheckoutRoutes.js";

const router = express.Router();

// ✅ Sub-routes
router.use("/auth", apiAuthRoutes);
router.use("/cart", apiCartRoutes);
router.use("/checkout", apiCheckoutRoutes);

// ✅ Inline Product Routes
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

router.get("/products/:id/stock", async (req, res) => {
  const productId = parseInt(req.params.id, 10);
  if (isNaN(productId)) return res.status(400).json({ error: "Invalid ID" });

  try {
    const db = await dbPromise;
    const product = await db.get(
      "SELECT id, name FROM products WHERE id = ?",
      productId
    );

    if (!product) return res.status(404).json({ error: "Product not found" });

    const stock = await db.all(
      "SELECT size, quantity FROM product_stock WHERE product_id = ?",
      productId
    );

    res.json({
      productId: product.id,
      productName: product.name,
      stock,
    });
  } catch (error) {
    console.error(`❌ Stock fetch error: ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
