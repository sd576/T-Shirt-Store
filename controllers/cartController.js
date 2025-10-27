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
  try {
    const db = await dbPromise;

    // Normalize + defaults
    const pid = Number(req.body.productId);
    const selectedSize =
      typeof req.body.size === "string" ? req.body.size.trim() : "";
    let qty = Number(req.body.quantity ?? 1);
    if (!Number.isFinite(qty) || qty < 1) qty = 1;

    if (!Number.isInteger(pid) || pid <= 0 || !selectedSize) {
      console.warn("❗ Invalid cart data (shape):", req.body);
      return res.status(400).send("Missing or invalid cart data");
    }

    // Get product
    const product = await db.get("SELECT * FROM products WHERE id = ?", pid);
    if (!product) return res.status(404).send("Product not found");

    // Validate size and stock from product_stock
    const stock = await db.get(
      "SELECT quantity FROM product_stock WHERE product_id = ? AND size = ?",
      [pid, selectedSize]
    );
    if (!stock || stock.quantity < qty) {
      return res
        .status(400)
        .send(
          `Only ${stock ? stock.quantity : 0} left for "${
            product.name
          }" (Size: ${selectedSize})`
        );
    }

    if (!req.session.cart) req.session.cart = [];
    const existing = req.session.cart.find(
      (i) => i.productId === product.id && i.size === selectedSize
    );
    if (existing) existing.quantity += qty;
    else {
      req.session.cart.push({
        productId: product.id,
        name: product.name,
        image: product.image,
        size: selectedSize,
        quantity: qty,
        price: product.price,
      });
    }

    return res.redirect("/cart");
  } catch (err) {
    console.error("❌ Error adding to cart:", err);
    return res.status(500).send("Internal Server Error");
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
