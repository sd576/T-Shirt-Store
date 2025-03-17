import dbPromise from "../database/db.js";

/**
 * GET /checkout
 * Show the Checkout Page with cart details.
 */
export const showCheckoutPage = (req, res) => {
  const cart = req.session.cart || [];

  if (cart.length === 0) {
    console.warn("⚠️ Empty cart. Redirecting to cart page.");
    return res.redirect("/cart");
  }

  res.render("checkout", { cart });
};

/**
 * POST /checkout
 * Process checkout: create order, save shipping, order items, update stock, clear cart.
 */
export const processCheckout = async (req, res) => {
  const cart = req.session.cart || [];

  if (cart.length === 0) {
    console.warn("❗ Checkout attempted with empty cart.");
    return res.status(400).send("Cart is empty.");
  }

  // Destructure and clean up incoming data
  let { fullName, email, phone, street, city, postcode, country } = req.body;

  if (!fullName || !email || !street || !city || !postcode || !country) {
    console.warn("❗ Missing shipping fields in checkout form.");
    return res.status(400).send("Please fill in all required shipping fields.");
  }

  // ✅ Transform data before inserting into DB
  fullName = toTitleCase(fullName);
  street = toTitleCase(street);
  city = toTitleCase(city);
  country = toTitleCase(country);
  postcode = postcode.toUpperCase();

  try {
    const db = await dbPromise;

    // Calculate total order amount
    const totalAmount = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const userId = 1; // For now, static user; replace with logged-in user later!
    const orderNumber = generateOrderNumber();

    // Insert the order into the orders table
    const orderResult = await db.run(
      `INSERT INTO orders (user_id, order_date, total_amount, status, order_number)
       VALUES (?, datetime('now'), ?, ?, ?)`,
      [userId, totalAmount, "processing", orderNumber],
    );

    const orderId = orderResult.lastID;
    console.log(`✅ Order #${orderId} created`);

    // Insert the shipping address
    await db.run(
      `INSERT INTO shipping_addresses
       (order_id, full_name, street, address_line2, city, postcode, country, phone, email)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        fullName,
        street,
        "", // address_line2 (optional)
        city,
        postcode,
        country,
        phone || "",
        email || "",
      ],
    );

    console.log(`✅ Shipping address saved for order #${orderId}`);

    // Insert the order items and update stock
    for (const item of cart) {
      const { productId, size, quantity, price } = item;

      // Insert order item
      await db.run(
        `INSERT INTO order_items (order_id, product_id, size, quantity, price)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, productId, size, quantity, price],
      );

      // Update stock
      await db.run(
        `UPDATE product_stock
         SET quantity = quantity - ?
         WHERE product_id = ? AND size = ?`,
        [quantity, productId, size],
      );
    }

    console.log(`✅ Order items added & stock updated for order #${orderId}`);

    // Clear the cart
    req.session.cart = [];

    // Redirect to the success page
    res.redirect(`/checkout/success?orderId=${orderId}`);
  } catch (err) {
    console.error("❌ Error during checkout process:", err);
    res.status(500).send("Something went wrong during checkout.");
  }
};

/**
 * GET /checkout/success
 * Show the checkout success page with Order ID.
 */
export const showCheckoutSuccess = async (req, res) => {
  const orderId = req.query.orderId;

  if (!orderId) {
    console.warn("⚠️ No orderId in checkout success query.");
    return res.redirect("/");
  }

  try {
    const db = await dbPromise;

    // Get order details
    const order = await db.get(`SELECT * FROM orders WHERE id = ?`, [orderId]);

    if (!order) {
      console.warn(`⚠️ No order found with ID: ${orderId}`);
      return res.redirect("/");
    }

    // Get shipping address
    const shippingAddress = await db.get(
      `SELECT * FROM shipping_addresses WHERE order_id = ?`,
      [orderId],
    );

    // Get order items (join products for image + name)
    const orderItems = await db.all(
      `SELECT oi.*, p.name AS productName, p.image
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [orderId],
    );

    console.log(`✅ Fetched order summary for order #${orderId}`);

    res.render("checkout-success", {
      order,
      shippingAddress,
      orderItems,
    });
  } catch (err) {
    console.error("❌ Error fetching checkout success data:", err);
    res.status(500).send("Something went wrong loading your order summary.");
  }
};

/**
 * Helpers
 */

// Generate a random 6-digit order number
function generateOrderNumber() {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return randomNum.toString();
}

// Convert a string to Title Case
function toTitleCase(str) {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
