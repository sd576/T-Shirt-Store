import express from "express";
import fetch from "node-fetch";
import jwt from "jsonwebtoken";

import dbPromise from "../database/db.js";

const router = express.Router();

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";

// ==================== REGISTER ROUTES ==================== //

// GET Register Page
router.get("/register", (req, res) => {
  res.render("register", {
    error: null,
    cart: req.session.cart || [],
    session: req.session,
  });
});

// POST Register Form Submission
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.render("register", {
        error: data.message || "Registration failed.",
        cart: req.session.cart || [],
        session: req.session,
      });
    }

    // Save token in session after successful registration
    req.session.token = data.token;

    // ✅ Set session.userInfo as well!
    const decodedUser = jwt.decode(data.token);
    req.session.userInfo = decodedUser;

    res.redirect("/my-account");
  } catch (error) {
    console.error("Error during registration:", error);
    res.render("register", {
      error: "Server error. Please try again later.",
      cart: req.session.cart || [],
      session: req.session,
    });
  }
});

// ==================== LOGIN ROUTES ==================== //

// GET Login Page
router.get("/login", (req, res) => {
  res.render("login", {
    error: null,
    cart: req.session.cart || [],
    session: req.session,
  });
});

// POST Login Form Submission
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.render("login", {
        error: data.message || "Login failed. Please check your credentials.",
        cart: req.session.cart || [],
        session: req.session,
      });
    }

    // Save token in session after successful login
    req.session.token = data.token;

    // ✅ Set session.userInfo here!
    req.session.userInfo = data.user; // Coming back from /api/auth/login

    res.redirect("/my-account");
  } catch (error) {
    console.error("Error during login:", error);
    res.render("login", {
      error: "Server error. Please try again later.",
      cart: req.session.cart || [],
      session: req.session,
    });
  }
});

// ==================== LOGOUT ==================== //

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
    }
    res.redirect("/login");
  });
});

// ==================== MY ACCOUNT ==================== //

router.get("/my-account", async (req, res) => {
  console.log("Session token at /my-account:", req.session.token);

  if (!req.session.token) {
    return res.redirect("/login");
  }

  try {
    const decodedUser = jwt.decode(req.session.token);
    const userId = decodedUser.id;

    const db = await dbPromise;

    // ✅ Get this user's orders
    const orders = await db.all(
      "SELECT * FROM orders WHERE user_id = ?",
      userId
    );

    // ✅ Set session.userInfo so it syncs across pages
    req.session.userInfo = decodedUser;

    res.render("my-account", {
      user: decodedUser,
      orders, // ✅ Pass orders here
      cart: req.session.cart || [],
      session: req.session,
    });
  } catch (error) {
    console.error("Error fetching my account info:", error);
    res.redirect("/login");
  }
});

export default router;
