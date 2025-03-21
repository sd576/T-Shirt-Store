import express from "express";
import dbPromise from "../database/db.js";

const router = express.Router();

// Home page → Show products from DB
router.get("/", async (req, res) => {
  try {
    const db = await dbPromise;
    const products = await db.all("SELECT * FROM products");

    const cart = req.session.cart || [];

    res.render("index", {
      products,
      cart,
      session: req.session,
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Product detail page → Show product with sizes
router.get("/product/:id", async (req, res) => {
  const productId = parseInt(req.params.id);

  if (isNaN(productId)) {
    return res.status(400).send("Invalid product ID");
  }

  try {
    const db = await dbPromise;

    const product = await db.get(
      "SELECT * FROM products WHERE id = ?",
      productId,
    );

    if (!product) {
      return res.status(404).send("Product not found");
    }

    const stock = await db.all(
      "SELECT size, quantity FROM product_stock WHERE product_id = ?",
      productId,
    );

    const cart = req.session.cart || [];

    res.render("tShirt", {
      product,
      stock,
      cart,
      session: req.session,
    });
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
