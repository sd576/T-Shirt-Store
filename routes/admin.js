import express from "express";
import dbPromise from "../database/db.js";

const router = express.Router();

// Admin Dashboard → show products from DB
router.get("/", async (req, res) => {
  try {
    const db = await dbPromise;
    const products = await db.all("SELECT * FROM products");

    const cart = req.session.cart || [];

    res.render("admin", {
      products,
      cart,
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Add product form → inserts into DB
router.post("/add-product", async (req, res) => {
  const { name, price } = req.body;

  // Basic validation
  if (!name || !price) {
    console.warn("Missing product name or price");
    return res.status(400).send("Missing product name or price");
  }

  try {
    const db = await dbPromise;

    await db.run(
      `INSERT INTO products (name, description, category, type, price, image)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        "Description goes here",
        "Uncategorized",
        "Misc",
        parseFloat(price),
        "/images/default.jpg",
      ]
    );

    console.log(`✅ New product added: ${name}`);
    res.redirect("/admin");
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
