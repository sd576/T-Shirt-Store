import express from "express";
import dbPromise from "../database/db.js";

const router = express.Router();

// Home page → Show products from DB
router.get("/", async (req, res) => {
  try {
    const db = await dbPromise;

    // Fetch all products from the database
    const products = await db.all("SELECT * FROM products");

    // Check if there is a cart session, otherwise create an empty cart
    const cart = req.session.cart || [];

    // Render the index.ejs view and pass the products and cart info
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

// Product detail page → Show a single product with sizes
router.get("/product/:id", async (req, res) => {
  // Get product ID from URL parameters, convert it to a number
  const productId = parseInt(req.params.id);

  // Check if productId is a valid number
  if (isNaN(productId)) {
    return res.status(400).send("Invalid product ID");
  }

  try {
    const db = await dbPromise;

    // Get the product details from the database
    const product = await db.get(
      "SELECT * FROM products WHERE id = ?",
      productId
    );

    // If the product doesn't exist, show a 404 page
    if (!product) {
      return res.status(404).send("Product not found");
    }

    // Get the stock levels for each size of the product
    const stock = await db.all(
      "SELECT size, quantity FROM product_stock WHERE product_id = ?",
      productId
    );

    // Attach stock as `sizes` property on product (makes EJS simpler)
    product.sizes = stock;

    // Grab cart from session, or empty array if none
    const cart = req.session.cart || [];

    // Render the tShirt.ejs page with product, cart, session info
    res.render("tShirt", {
      product,
      cart,
      session: req.session,
    });
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
