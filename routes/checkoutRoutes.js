import express from "express";
import jwt from "jsonwebtoken";
import dbPromise from "../database/db.js";

const router = express.Router();

/**
 * GET /checkout (main checkout form)
 */
router.get("/", async (req, res) => {
  console.log("✅ Checkout route session:", req.session);

  const token = req.session.token;

  if (!token) {
    console.log("🟢 No token found. Showing guest or login option.");
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
 * POST /checkout (logged-in user)
 */
router.post("/", (req, res) => {
  const { name, email, phone, street, city, postcode, country } = req.body;

  req.session.userInfo = {
    name: name || "Guest",
    email,
    phone,
    shippingAddress: {
      street,
      city,
      postcode,
      country,
    },
  };

  console.log("✅ User info stored:", req.session.userInfo);

  res.redirect("/checkout/review");
});

/**
 * POST /checkout/guest (guest user)
 */
router.post("/guest", (req, res) => {
  const { name, email, phone, street, city, postcode, country } = req.body;

  req.session.guestInfo = {
    name: name || "Guest",
    email,
    phone,
    shippingAddress: {
      street,
      city,
      postcode,
      country,
    },
  };

  console.log("✅ Guest info stored:", req.session.guestInfo);

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

  // ✅ Enhanced dummy payment validation
  const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
  let isFutureExpiry = false;

  if (expiryDate && expiryRegex.test(expiryDate)) {
    const [month, year] = expiryDate.split("/").map(Number);
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear() % 100; // e.g. 25 for 2025

    isFutureExpiry =
      year > currentYear || (year === currentYear && month >= currentMonth);
  }

  const strippedCardNumber = cardNumber ? cardNumber.replace(/\s/g, "") : "";
  const isCardNumberValid = strippedCardNumber.length === 16;

  const isCvvValid = cvv && cvv.length === 3 && !["000", "999"].includes(cvv);

  if (
    !isCardNumberValid ||
    !expiryDate ||
    !expiryRegex.test(expiryDate) ||
    !isFutureExpiry ||
    !isCvvValid
  ) {
    let errorMsg = "Please enter valid card details!";

    if (!isCardNumberValid) {
      errorMsg = "Card number must be exactly 16 digits.";
    } else if (!expiryRegex.test(expiryDate) || !isFutureExpiry) {
      errorMsg = "Expiry date must be in MM/YY format and in the future.";
    } else if (!isCvvValid) {
      errorMsg = "CVV must be 3 digits and cannot be 000 or 999.";
    }

    console.log("❌ Invalid payment details");
    return res.render("checkout-payment", {
      session: req.session,
      cart,
      user: req.session.userInfo || req.session.guestInfo || { name: "Guest" },
      error: errorMsg,
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
        "Complete",
        orderNumber,
      ]
    );

    const orderId = result.lastID;
    req.session.lastOrderId = orderId;

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

    // ✅ Set fullName correctly
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
        fullName,
        shippingAddress.street || "",
        shippingAddress.address_line2 || "",
        shippingAddress.city || "",
        shippingAddress.postcode || "",
        shippingAddress.country || "",
        shippingAddress.phone || "",
        userSession.email || "",
      ]
    );

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

    req.session.cart = [];

    if (req.session.guestInfo) {
      req.session.guestInfo = null;
    }

    res.redirect("/checkout/complete");
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
router.get("/complete", async (req, res) => {
  const db = await dbPromise;
  const lastOrderId = req.session.lastOrderId;

  if (!lastOrderId) {
    console.log("❌ No lastOrderId found in session");
    return res.redirect("/");
  }

  // ✅ Query the real order data
  const order = await db.get("SELECT * FROM orders WHERE id = ?", lastOrderId);
  const orderItems = await db.all(
    "SELECT * FROM order_items WHERE order_id = ?",
    lastOrderId
  );
  const shippingAddress = await db.get(
    "SELECT * FROM shipping_addresses WHERE order_id = ?",
    lastOrderId
  );

  // ✅ Clear lastOrderId after use
  req.session.lastOrderId = null;

  // ✅ Render the success page with real data
  res.render("checkout-success", {
    session: req.session,
    order,
    orderItems,
    shippingAddress,
    guestCheckout: !req.session.token,
    userName:
      req.session.userInfo?.name || req.session.guestInfo?.name || "Guest",
  });
});

/**
 * GET /checkout/success
 * For direct order lookup from query params (e.g. from API tests)
 */
router.get("/success", async (req, res) => {
  const db = await dbPromise;
  const { orderId, guestCheckout } = req.query;

  if (!orderId) {
    console.log("❌ Missing orderId in query");
    return res.redirect("/");
  }

  // Fetch order data
  const order = await db.get("SELECT * FROM orders WHERE id = ?", orderId);
  const orderItems = await db.all(
    "SELECT * FROM order_items WHERE order_id = ?",
    orderId
  );
  const shippingAddress = await db.get(
    "SELECT * FROM shipping_addresses WHERE order_id = ?",
    orderId
  );

  if (!order || !orderItems.length || !shippingAddress) {
    console.log("❌ Order data not found for orderId:", orderId);
    return res.status(404).render("404");
  }

  res.render("checkout-success", {
    session: req.session,
    order,
    orderItems,
    shippingAddress,
    guestCheckout: guestCheckout === "1",
    userName:
      req.session.userInfo?.name || req.session.guestInfo?.name || "Guest",
  });
});

export default router;
