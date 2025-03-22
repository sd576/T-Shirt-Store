import express from "express";
import jwt from "jsonwebtoken";
import dbPromise from "../database/db.js";

const router = express.Router();

/**
 * GET /checkout
 */
router.get("/", async (req, res) => {
  console.log("✅ Checkout route session:", req.session);

  const token = req.session.token;

  if (!token) {
    console.log("🟢 No token found. Showing options for guest or login.");
    return res.render("checkout-choice", {
      session: req.session,
    });
  }

  try {
    const decodedUser = jwt.decode(token);
    const db = await dbPromise;

    const userDetails = await db.get(
      "SELECT name, email FROM users WHERE id = ?",
      decodedUser.id
    );

    const shippingAddress = await db.get(
      "SELECT * FROM shipping_addresses WHERE user_id = ? ORDER BY id DESC LIMIT 1",
      decodedUser.id
    );

    const user = {
      id: decodedUser.id,
      name: userDetails?.name || "",
      email: userDetails?.email || "",
      phone: shippingAddress?.phone || "",
      street: shippingAddress?.street || "",
      address_line2: shippingAddress?.address_line2 || "",
      city: shippingAddress?.city || "",
      postcode: shippingAddress?.postcode || "",
      country: shippingAddress?.country || "",
    };

    res.render("checkout", {
      session: req.session,
      user,
      cart: req.session.cart || [],
      guestCheckout: false,
    });
  } catch (error) {
    console.error("❌ Error loading checkout page:", error);
    res.redirect("/cart");
  }
});

/**
 * POST /checkout
 */
router.post("/", (req, res) => {
  const { name, email, shippingAddress, checkoutAsGuest } = req.body;

  if (checkoutAsGuest === "on") {
    req.session.guestInfo = {
      name: name || "Guest",
      email,
      shippingAddress,
    };
    return res.redirect("/checkout/review");
  }

  req.session.userInfo = {
    name: name || "Guest",
    email,
    shippingAddress,
  };

  res.redirect("/checkout/review");
});

/**
 * POST /checkout/complete
 */
router.post("/complete", async (req, res) => {
  const { cardNumber, expiryDate, cvv } = req.body;
  const db = await dbPromise;
  const cart = req.session.cart || [];

  if (!cart.length) {
    console.log("❌ Cart is empty at checkout complete");
    return res.redirect("/cart");
  }

  // ✅ Dummy payment validation
  if (
    !cardNumber ||
    cardNumber.length !== 16 ||
    !expiryDate ||
    !cvv ||
    cvv.length !== 3
  ) {
    console.log("❌ Invalid payment details");
    return res.render("checkout-payment", {
      session: req.session,
      cart,
      user: req.session.userInfo || req.session.guestInfo || { name: "Guest" },
      error: "Please enter valid card details!",
    });
  }

  console.log("✅ Dummy payment successful");

  const decodedUser = req.session.token ? jwt.decode(req.session.token) : null;
  const userSession = req.session.userInfo || req.session.guestInfo;

  if (!userSession || !userSession.name || !userSession.email) {
    console.log("❌ Missing user session data at complete checkout");
    return res.redirect("/checkout");
  }

  let userDetails = null;

  if (decodedUser) {
    userDetails = await db.get(
      "SELECT name, email FROM users WHERE id = ?",
      decodedUser.id
    );
  }

  try {
    await db.run("BEGIN");

    const orderNumber = `ORD-${Date.now()}-${Math.floor(
      Math.random() * 10000
    )}`;

    const result = await db.run(
      `
        INSERT INTO orders (user_id, total_amount, status, order_number, order_date)
        VALUES (?, ?, ?, ?, datetime('now'))
      `,
      [
        decodedUser ? decodedUser.id : null,
        cart.reduce((acc, item) => acc + item.price * item.quantity, 0),
        "Processing", // or "Complete" if you're testing hardcoded
        orderNumber,
      ]
    );

    const orderId = result.lastID;

    let shippingAddress = userSession.shippingAddress || {};

    if (decodedUser) {
      const dbShippingAddress = await db.get(
        "SELECT * FROM shipping_addresses WHERE user_id = ? ORDER BY id DESC LIMIT 1",
        decodedUser.id
      );

      if (dbShippingAddress) {
        shippingAddress = dbShippingAddress;
      }
    }

    // ✅ Use proper full name!
    const fullName = decodedUser
      ? userDetails?.name || "Guest"
      : userSession.name || "Guest";

    await db.run(
      `
        INSERT INTO shipping_addresses
          (order_id, user_id, full_name, street, address_line2, city, postcode, country, phone, email)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        orderId,
        decodedUser ? decodedUser.id : null,
        fullName, // ✅ FIXED
        shippingAddress.street || "",
        shippingAddress.address_line2 || "",
        shippingAddress.city || "",
        shippingAddress.postcode || "",
        shippingAddress.country || "",
        shippingAddress.phone || "",
        userSession.email || "",
      ]
    );

    // ✅ Insert order items from cart
    const insertOrderItem = await db.prepare(`
      INSERT INTO order_items
        (order_id, product_id, size, quantity, price)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const item of cart) {
      await insertOrderItem.run(
        orderId,
        item.productId,
        item.size,
        item.quantity,
        item.price
      );
    }

    await insertOrderItem.finalize();

    await db.run("COMMIT");

    const order = await db.get("SELECT * FROM orders WHERE id = ?", orderId);
    const orderItems = await db.all(
      "SELECT * FROM order_items WHERE order_id = ?",
      orderId
    );
    const shippingAddressData = await db.get(
      "SELECT * FROM shipping_addresses WHERE order_id = ?",
      orderId
    );

    console.log("✅ Order Complete:", {
      order,
      orderItems,
      shippingAddressData,
    });

    if (!order || !shippingAddressData) {
      console.error(
        "❌ Missing order or shipping address for checkout-success page."
      );
      return res.render("checkout-success", {
        session: req.session,
        error:
          "We couldn't retrieve your order details. Please check your order history.",
      });
    }

    req.session.cart = [];

    if (req.session.guestInfo) {
      req.session.guestInfo = null;
    }

    res.render("checkout-success", {
      session: req.session,
      order,
      orderItems,
      shippingAddress: shippingAddressData,
      guestCheckout: !decodedUser,
      userName: fullName, // ✅ PASS THE FIXED NAME TO THE EJS
    });
  } catch (error) {
    console.error("❌ Error completing checkout:", error);
    await db.run("ROLLBACK");
    res.redirect("/checkout/review");
  }
});

/**
 * GET /checkout/guest
 */
router.get("/guest", (req, res) => {
  const guestUser = {
    name: "",
    email: "",
    phone: "",
    street: "",
    address_line2: "",
    city: "",
    postcode: "",
    country: "",
  };

  res.render("checkout", {
    session: req.session,
    user: guestUser,
    cart: req.session.cart || [],
    guestCheckout: true,
  });
});

/**
 * GET /checkout/review
 */
router.get("/review", async (req, res) => {
  const db = await dbPromise;
  const cart = req.session.cart || [];

  if (!cart.length) return res.redirect("/cart");

  const decodedUser = req.session.token ? jwt.decode(req.session.token) : null;

  let shippingAddress = {};
  let userName = "Guest";
  let userEmail = "";

  if (decodedUser) {
    const dbUser = await db.get(
      "SELECT name, email FROM users WHERE id = ?",
      decodedUser.id
    );

    shippingAddress = await db.get(
      "SELECT * FROM shipping_addresses WHERE user_id = ? ORDER BY id DESC LIMIT 1",
      decodedUser.id
    );

    userName = dbUser?.name || "Guest";
    userEmail = dbUser?.email || "";
  } else {
    shippingAddress = req.session.guestInfo?.shippingAddress || {};
    userName = req.session.guestInfo?.name || "Guest";
    userEmail = req.session.guestInfo?.email || "";
  }

  res.render("checkout-review", {
    session: req.session,
    user: {
      name: userName,
      email: userEmail,
      street: shippingAddress?.street || "",
      address_line2: shippingAddress?.address_line2 || "",
      city: shippingAddress?.city || "",
      postcode: shippingAddress?.postcode || "",
      country: shippingAddress?.country || "",
      phone: shippingAddress?.phone || "",
    },
    cart,
  });
});

/**
 * GET /checkout/payment
 */
router.get("/payment", (req, res) => {
  const cart = req.session.cart || [];

  if (!cart.length) {
    return res.redirect("/cart");
  }

  const user = req.session.userInfo ||
    req.session.guestInfo || { name: "Guest" };

  res.render("checkout-payment", {
    session: req.session,
    cart,
    user,
    error: null,
  });
});

/**
 * POST /checkout/payment
 */
router.post("/payment", (req, res) => {
  const { cardNumber, expiryDate, cvv } = req.body;
  const cart = req.session.cart || [];

  if (
    !cardNumber ||
    cardNumber.length !== 16 ||
    !expiryDate ||
    !cvv ||
    cvv.length !== 3
  ) {
    console.log("❌ Invalid payment details");

    return res.render("checkout-payment", {
      session: req.session,
      cart,
      user: req.session.userInfo || req.session.guestInfo || { name: "Guest" },
      error: "Please enter valid card details!",
    });
  }

  console.log("✅ Dummy payment successful");

  res.redirect("/checkout/complete");
});

/**
 * GET /checkout/complete
 */
router.get("/complete", (req, res) => {
  res.redirect("/my-account");
});

export default router;
