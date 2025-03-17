import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dbPromise from "../database/db.js"; // <-- you are importing the promise here
import dotenv from "dotenv";

dotenv.config();

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const db = await dbPromise; // <-- wait for the database connection!

    const userExists = await db.get("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.run(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    const token = jwt.sign(
      {
        id: result.lastID,
        email: email,
        name: name,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token: token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Registration failed" });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const db = await dbPromise;

    const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);

    // 🚫 No user found
    if (!user) {
      console.log("❌ No user found for email:", email);
      return res.render("login", {
        error: "Invalid email or password",
        cart: req.session.cart || [],
        session: req.session, // ✅
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    // 🚫 Password doesn't match
    if (!isMatch) {
      console.log("❌ Password mismatch for email:", email);
      return res.render("login", {
        error: "Invalid email or password",
        cart: req.session.cart || [],
        session: req.session, // ✅
      });
    }

    // ✅ Success: Set session info!
    req.session.userInfo = {
      id: user.id,
      name: user.name,
      email: user.email,
      shippingAddress: user.shipping_address || "",
    };

    console.log("✅ Logged in user:", req.session.userInfo);

    // 🚀 Redirect to account page
    res.redirect("/my-account");
  } catch (error) {
    console.error("❌ Error during login:", error);
    res.render("login", {
      error: "Login failed",
      cart: req.session.cart || [],
      session: req.session, // ✅
    });
  }
};

export const apiLoginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const db = await dbPromise;

    const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);

    // 🚫 No user found
    if (!user) {
      console.log("❌ No user found for email (API):", email);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    // 🚫 Password doesn't match
    if (!isMatch) {
      console.log("❌ Password mismatch for email (API):", email);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // ✅ Success: Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    console.log("✅ API logged in user:", user.email);

    // ✅ Return JSON with token and user info
    res.json({
      message: "Login successful",
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error("❌ API login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};


export const logoutUser = (req, res) => {
  res
    .status(200)
    .json({ message: "Logout successful (discard token client-side)" });
};
