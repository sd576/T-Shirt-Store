import express from "express";
import dbPromise from "../database/db.js"; // ✅ Adjust the path if needed

const router = express.Router();

router.post("/", async (req, res) => {
  const { productId, name, price, size, quantity, image } = req.body;

  if (!productId || !size || !quantity) {
    return res.status(400).json({ error: "Missing cart item data" });
  }

  const db = await dbPromise;

  try {
    const stock = await db.get(
      `SELECT quantity FROM product_stock WHERE product_id = ? AND size = ?`,
      [productId, size]
    );

    if (!stock || stock.quantity < parseInt(quantity)) {
      return res.status(400).json({
        error: `Only ${stock ? stock.quantity : 0} left for "${name}" (Size: ${size}).`,
      });
    }

    req.session.cart = req.session.cart || [];

    req.session.cart.push({
      productId,
      name,
      price,
      size,
      quantity: parseInt(quantity),
      image,
    });

    return res.status(200).json({
      message: "Item added to cart",
      cart: req.session.cart,
    });
  } catch (err) {
    console.error("❌ Error checking stock or adding to cart:", err);
    return res.status(500).json({ error: "Server error while adding to cart" });
  }
});

export default router;
