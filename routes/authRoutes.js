import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
} from "../controllers/authController.js";

const router = express.Router();

// ==================== PAGE ROUTES ==================== //

// GET: Login page
router.get("/login", (req, res) => {
  res.render("login", {
    error: null,
    cart: req.session.cart || [],
  });
});

// GET: Register page
router.get("/register", (req, res) => {
  res.render("register", {
    error: null,
    cart: req.session.cart || [],
  });
});

// GET: My Account page
router.get("/my-account", (req, res) => {
  const user = req.session.userInfo; // ✅ This fixes it

  if (!user) {
    return res.redirect("/login");
  }

  // Mock orders - replace with DB query in real life!
  const orders = [
    {
      order_number: "ORD123",
      status: "Shipped",
      total_amount: 49.99,
      order_date: "2025-03-25",
    },
    {
      order_number: "ORD124",
      status: "Processing",
      total_amount: 29.99,
      order_date: "2025-03-27",
    },
  ];

  res.render("my-account", {
    user, // ✅ Now populated properly
    orders,
    cart: req.session.cart || [],
  });
});

// ==================== FORM ACTION ROUTES ==================== //

// POST: Register form submit
router.post("/register", registerUser);

// POST: Login form submit
router.post("/login", loginUser);

// GET: Logout (alternative to POST logout)
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.redirect("/my-account");
    }
    res.redirect("/login");
  });
});

// OR KEEP this POST /logout (depends on how your logout button works)
router.post("/logout", logoutUser);

export default router;
