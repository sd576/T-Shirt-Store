import dbPromise from "../database/db.js";

// ✅ View Cart
export const viewCart = (req, res) => {
  const cart = req.session.cart || [];

  res.render("cart", {
    cart,
    session: req.session, // Pass session for header, auth, etc.
  });
};

// ✅ Add to Cart
export const addToCart = async (req, res) => {
  const productId = parseInt(req.body.productId, 10);
  const selectedSize = req.body.size;
  const quantity = parseInt(req.body.quantity, 10);

  if (!productId || !selectedSize || isNaN(quantity) || quantity < 1) {
    console.warn("❗ Invalid cart data:", req.body);
    return res.status(400).send("Missing or invalid cart data");
  }

  try {
    const db = await dbPromise;

    // Get the product details
    const product = await db.get(
      "SELECT * FROM products WHERE id = ?",
      productId
    );

    if (!product) {
      console.warn(`❗ Product not found for ID: ${productId}`);
      return res.status(404).send("Product not found");
    }

    // Get the stock level for the selected size
    const stock = await db.get(
      "SELECT quantity FROM product_stock WHERE product_id = ? AND size = ?",
      [productId, selectedSize]
    );

    if (!stock || stock.quantity < quantity) {
      console.warn(
        `❗ Not enough stock for "${
          product.name
        }" (Size: ${selectedSize}). Requested: ${quantity}, Available: ${
          stock ? stock.quantity : 0
        }`
      );
      return res
        .status(400)
        .send(
          `Only ${stock ? stock.quantity : 0} left for "${
            product.name
          }" (Size: ${selectedSize})`
        );
    }

    // Initialize cart if it doesn't exist yet
    if (!req.session.cart) {
      req.session.cart = [];
    }

    // Check if item already exists in the cart
    const existingItem = req.session.cart.find(
      (item) => item.productId === product.id && item.size === selectedSize
    );

    if (existingItem) {
      existingItem.quantity += quantity;
      console.log(
        `✅ Updated "${product.name}" (Size: ${selectedSize}) in cart. New Qty: ${existingItem.quantity}`
      );
    } else {
      req.session.cart.push({
        productId: product.id,
        name: product.name,
        image: product.image,
        size: selectedSize,
        quantity: quantity,
        price: product.price,
      });
      console.log(
        `✅ Added "${product.name}" (Size: ${selectedSize}, Qty: ${quantity}) to cart`
      );
    }

    res.redirect("/cart");
  } catch (err) {
    console.error("❌ Error adding to cart:", err);
    res.status(500).send("Internal Server Error");
  }
};

// ✅ Remove from Cart
export const removeFromCart = (req, res) => {
  const productId = parseInt(req.body.productId, 10);
  const selectedSize = req.body.size;

  if (!req.session.cart) {
    req.session.cart = [];
  }

  // Filter out the item by productId and size
  req.session.cart = req.session.cart.filter(
    (item) => item.productId !== productId || item.size !== selectedSize
  );

  console.log(
    `✅ Removed product ${productId} (Size: ${selectedSize}) from cart`
  );

  res.redirect("/cart");
};

// ✅ Update Cart Quantities
export const updateCart = (req, res) => {
  const updatedQuantities = req.body.quantities;

  if (!req.session.cart || !updatedQuantities) {
    console.warn("❗ No cart session or quantities provided");
    return res.redirect("/cart");
  }

  req.session.cart.forEach((item) => {
    // Match quantities by key structure "productId_size"
    const key = `${item.productId}_${item.size}`;
    const newQty = parseInt(updatedQuantities[key], 10);

    if (!isNaN(newQty) && newQty > 0) {
      console.log(
        `✅ Updated "${item.name}" (Size: ${item.size}) to Qty: ${newQty}`
      );
      item.quantity = newQty;
    } else {
      console.warn(
        `❗ Invalid quantity (${newQty}) for "${item.name}" (Size: ${item.size})`
      );
    }
  });

  res.redirect("/cart");
};
