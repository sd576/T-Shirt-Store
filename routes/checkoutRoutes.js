import express from "express";
const router = express.Router();

/**
 * GET /checkout
 * Render the checkout page.
 */
router.get("/", (req, res) => {
  // Get user info (logged in or guest)
  const userSession = req.session.userInfo || req.session.guestInfo || {};

  // Prepare user data for the form fields
  const user = {
    name: userSession.name || "Guest",
    email: userSession.email || "",
    shippingAddress: userSession.shippingAddress || "",
  };

  console.log("🟢 Rendering checkout page, user:", user);

  res.render("checkout", {
    session: req.session,
    user, // ✅ this gives EJS access to user info
    cart: req.session.cart || [],
  });
});

/**
 * POST /checkout
 * Handle checkout form submission
 */
router.post("/", (req, res) => {
  const { name, email, shippingAddress, checkoutAsGuest } = req.body;

  // Handle guest checkout
  if (checkoutAsGuest === "on") {
    req.session.guestInfo = {
      name: name || "Guest",
      email,
      shippingAddress,
    };

    console.log("✅ Guest checkout info saved:", req.session.guestInfo);
    return res.redirect("/checkout/review");
  }

  // Save user info for logged-in checkout
  req.session.userInfo = {
    name: name || "Guest",
    email,
    shippingAddress,
  };

  console.log("✅ Logged-in user checkout info saved:", req.session.userInfo);
  res.redirect("/checkout/review");
});

/**
 * POST /checkout/complete
 * Complete the order and clear session data
 */
router.post("/complete", (req, res) => {
  // Clear cart and user sessions after checkout success
  req.session.cart = [];
  req.session.guestInfo = null;
  req.session.userInfo = null;

  console.log("✅ Checkout complete, sessions cleared");

  res.render("checkout-success", { session: req.session });
});

export default router;
