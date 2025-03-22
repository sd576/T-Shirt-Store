import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dbPromise from "../database/db.js";
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

export const apiRegisterUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const db = await dbPromise;

    const userExists = await db.get("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    console.log({
      name,
      email,
      hashedPassword,
    });

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
      message: "User registered successfully (API",
      token: token,
      user: {
        id: result.lastID,
        name: name,
        email: email,
      },
    });
  } catch (error) {
    console.error("❌ API Registration error:", error);
    res.status(500).json({ message: "Registration failed" });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const db = await dbPromise;

    const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);

    if (!user) {
      console.log("❌ No user found for email:", email);
      return res.render("login", {
        error: "Invalid email or password",
        success: false,
        cart: req.session.cart || [],
        session: req.session,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log("❌ Password mismatch for email:", email);
      return res.render("login", {
        error: "Invalid email or password",
        success: false,
        cart: req.session.cart || [],
        session: req.session,
      });
    }

    // ✅ Set session info
    req.session.userInfo = {
      id: user.id,
      name: user.name,
      email: user.email,
      shippingAddress: user.shipping_address || "",
    };

    // ✅ Generate token and save in session
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    req.session.token = token;

    console.log("✅ Logged in user:", req.session.userInfo);
    console.log("✅ Token stored in session:", token);

    // ✅ You can also pass success = true when redirected or rendered:
    res.redirect("/my-account");
  } catch (error) {
    console.error("❌ Error during login:", error);
    res.render("login", {
      error: "Login failed",
      success: false,
      cart: req.session.cart || [],
      session: req.session,
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
        email: user.email,
      },
    });
  } catch (error) {
    console.error("❌ API login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// ✅ Patch user account
export const updateUserAccount = async (req, res) => {
  const { id } = req.params;
  const { name, email, password } = req.body;

  try {
    const db = await dbPromise;

    // Check if user exists
    const existingUser = await db.get("SELECT * FROM users WHERE id = ?", [id]);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Build update fields dynamically
    const updates = [];
    const values = []; // ✅ renamed consistently

    if (name) {
      updates.push("name = ?");
      values.push(name);
    }

    if (email) {
      updates.push("email = ?");
      values.push(email);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push("password = ?");
      values.push(hashedPassword);
    }

    if (updates.length === 0) {
      return res
        .status(400)
        .json({ message: "No valid fields provided to update" });
    }

    values.push(id); // ✅ now matches the array

    // Perform the update
    const query = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;
    await db.run(query, values); // ✅ using the correct array

    res.status(200).json({
      message: "User updated successfully",
      updatedFields: { name, email },
    });
  } catch (error) {
    console.error("❌ Update user error:", error);
    res.status(500).json({ message: "Error updating user" });
  }
};

// ✅ Web logout (session-based)
export const logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.redirect("/my-account");
    }
    res.redirect("/login");
  });
};

export const apiLogoutUser = (req, res) => {
  res.status(200).json({
    message: "Logout successful (discard token client-side)",
  });
};
