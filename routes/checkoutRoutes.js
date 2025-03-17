import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  const userSession = req.session.userInfo || req.session.guestInfo || {};

  const user = {
    name: userSession.name || "Guest",
    email: userSession.email || "",
    shippingAddress: userSession.shippingAddress || "",
  };

  console.log("🟢 Rendering checkout, user:", user);

  res.render("checkout", {
    session: req.session,
    user,
    cart: req.session.cart || [],
  });
});

router.post("/", async (req, res) => {
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

router.post("/complete", (req, res) => {
  req.session.cart = [];
  req.session.guestInfo = null;
  req.session.userInfo = null;

  res.render("checkout-success", { session: req.session });
});

export default router;
