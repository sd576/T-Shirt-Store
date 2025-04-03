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

    await db.run("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [
      name,
      email,
      password,
    ]);

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

    const result = await db.run(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, password]
    );

    res.status(201).json({
      message: "User registered successfully (API)",
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

    if (!user || user.password !== password) {
      return res.render("login", {
        error: "Invalid email or password",
        success: false,
        cart: req.session.cart || [],
        session: req.session,
      });
    }

    // ✅ Store user info for header rendering
    req.session.userInfo = {
      id: user.id,
      name: user.name,
      email: user.email,
      shippingAddress: user.shipping_address || "",
    };

    // ✅ Generate a real JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    // ✅ Save token in session
    req.session.token = token;

    console.log("✅ Logged in user:", req.session.userInfo);
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

    if (!user) {
      console.log("❌ No user found for email (API):", email);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (user.password !== password) {
      console.log("❌ Password mismatch for email (API):", email);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    console.log("✅ API logged in user:", user.email);

    // ✅ This is what allows the session to work across routes!
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    res.json({
      message: "Login successful",
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
    const values = [];

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

    values.push(id);

    // Perform the update
    const query = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;
    await db.run(query, values);

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
      console.error("❌ Logout error:", err);
      return res.redirect("/my-account");
    }

    console.log("✅ User logged out, session destroyed.");
    res.redirect("/login");
  });
};

export const apiLogoutUser = (req, res) => {
  res.status(200).json({
    message: "Logout successful (discard token client-side)",
  });
};
