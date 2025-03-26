import express from "express";
const router = express.Router();

router.post("/", (req, res) => {
  const { productId, name, price, size, quantity, image } = req.body;

  if (!productId || !size || !quantity) {
    return res.status(400).json({ error: "Missing cart item data" });
  }

  req.session.cart = req.session.cart || [];

  req.session.cart.push({
    productId,
    name,
    price,
    size,
    quantity,
    image,
  });

  return res
    .status(200)
    .json({ message: "Item added to cart", cart: req.session.cart });
});

export default router;
