import dbPromise from "../database/db.js";

// ✅ View Cart
export const viewCart = (req, res) => {
  const cart = req.session.cart || [];
  
  res.render("cart", { 
    cart, 
    session: req.session  // Pass session to the template
  });
};

// ✅ Add to Cart
export const addToCart = async (req, res) => {
  const productId = parseInt(req.body.productId, 10);
  const selectedSize = req.body.size;
  const quantity = parseInt(req.body.quantity, 10);

  // ✅ Validate input
  if (!productId || !selectedSize || isNaN(quantity) || quantity < 1) {
    console.warn("❗ Invalid cart data", req.body);
    return res.status(400).send("Missing or invalid cart data");
  }

  try {
    const db = await dbPromise;

    // ✅ Get product from DB
    const product = await db.get(
      "SELECT * FROM products WHERE id = ?",
      productId,
    );

    if (!product) {
      console.warn(`❗ Product not found for ID: ${productId}`);
      return res.status(404).send("Product not found");
    }

    // ✅ Initialize session cart if it doesn't exist
    if (!req.session.cart) {
      req.session.cart = [];
    }

    // ✅ Push full product info into session cart
    req.session.cart.push({
      productId: product.id,
      name: product.name,
      image: product.image,
      size: selectedSize,
      quantity: quantity,
      price: product.price,
    });

    console.log(
      `✅ Added product "${product.name}" (size ${selectedSize}, qty ${quantity}) to cart`,
    );

    res.redirect("/cart");
  } catch (err) {
    console.error("❌ Error adding to cart:", err);
    res.status(500).send("Internal Server Error");
  }
};

// ✅ Remove from Cart
export const removeFromCart = (req, res) => {
  const productId = parseInt(req.body.productId);

  if (!req.session.cart) {
    req.session.cart = [];
  }

  req.session.cart = req.session.cart.filter(
    (item) => item.productId !== productId,
  );

  res.redirect("/cart");
};
