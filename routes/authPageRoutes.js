import express from "express";
import fetch from "node-fetch"; // You could switch to axios if you prefer
import jwt from "jsonwebtoken";

const router = express.Router();

// ==================== REGISTER ROUTES ==================== //

// GET Register Page
router.get("/register", (req, res) => {
  res.render("register", { error: null });
});

// POST Register Form Submission
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const response = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.render("register", {
        error: data.message || "Registration failed.",
      });
    }

    // Save token in session after successful registration
    req.session.token = data.token;

    res.redirect("/my-account");
  } catch (error) {
    console.error("Error during registration:", error);
    res.render("register", { error: "Server error. Please try again later." });
  }
});

// ==================== LOGIN ROUTES ==================== //

// GET Login Page
router.get("/login", (req, res) => {
  res.render("login", { error: null });
});

// POST Login Form Submission
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const response = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.render("login", {
        error: data.message || "Login failed. Please check your credentials.",
      });
    }

    // Save token in session after successful login
    req.session.token = data.token;

    res.redirect("/my-account");
  } catch (error) {
    console.error("Error during login:", error);
    res.render("login", { error: "Server error. Please try again later." });
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

router.get("/my-account", (req, res) => {
  if (!req.session.token) {
    return res.redirect("/login");
  }

  const decodedUser = jwt.decode(req.session.token);

  res.render("my-account", { user: decodedUser });
});

export default router;
