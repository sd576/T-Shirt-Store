import express from "express";
import jwt from "jsonwebtoken";
import { registerUser, loginUser } from "../controllers/authController.js";
import ensureAuthenticated from "../middleware/ensureAuthenticated.js";
import dbPromise from "../database/db.js";

const router = express.Router();

// ==================== LOGIN ROUTES ==================== //

// GET: Login page
router.get("/login", (req, res) => {
  res.render("login", {
    error: null,
    success: false,
    cart: req.session.cart || [],
    session: req.session,
  });
});

// POST: Login form submit
router.post("/login", loginUser);

// ==================== REGISTER ROUTES ==================== //

// GET: Register page
router.get("/register", (req, res) => {
  res.render("register", {
    error: null,
    cart: req.session.cart || [],
    session: req.session,
  });
});

// POST: Register form submit
router.post("/register", registerUser);

// ==================== MY ACCOUNT ROUTES ==================== //

// GET: My Account page
router.get("/my-account", ensureAuthenticated, async (req, res) => {
  const decodedUser = jwt.decode(req.session.token);

  if (!decodedUser) {
    console.log("❌ Invalid token. Redirecting to login.");
    return res.redirect("/login");
  }

  const db = await dbPromise;

  const orders = await db.all(
    "SELECT * FROM orders WHERE user_id = ?",
    decodedUser.id
  );

  const shippingAddress = await db.get(
    "SELECT * FROM shipping_addresses WHERE user_id = ?",
    decodedUser.id
  );

  res.render("my-account", {
    user: decodedUser,
    orders,
    shippingAddress,
    cart: req.session.cart || [],
    session: req.session,
  });
});

// ==================== EDIT ORDER ==================== //

// GET: Edit Order page
router.get(
  "/my-account/orders/:id/edit",
  ensureAuthenticated,
  async (req, res) => {
    const decodedUser = jwt.decode(req.session.token);

    if (!decodedUser) {
      console.log("❌ Invalid token. Redirecting to login.");
      return res.redirect("/login");
    }

    const db = await dbPromise;
    const orderId = req.params.id;

    try {
      const order = await db.get(
        "SELECT * FROM orders WHERE id = ? AND user_id = ?",
        [orderId, decodedUser.id]
      );

      if (!order) {
        console.log("❌ Order not found or unauthorized access.");
        return res.redirect("/my-account");
      }

      res.render("edit-order", {
        order,
        session: req.session,
        cart: req.session.cart || [],
      });
    } catch (error) {
      console.error("❌ Error loading edit order page:", error);
      res.redirect("/my-account");
    }
  }
);

// ==================== LOGOUT ROUTE ==================== //

// GET: Logout
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("❌ Logout error:", err);
      return res.redirect("/my-account");
    }
    console.log("✅ User successfully logged out");
    res.redirect("/login");
  });
});

// ==================== FORGOT PASSWORD ROUTES ==================== //

// GET: Forgot Password page
router.get("/forgot-password", (req, res) => {
  res.render("forgot-password", {
    error: null,
    success: null,
    session: req.session,
    cart: req.session.cart || [],
  });
});

// POST: Forgot Password form submit
router.post("/forgot-password", async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.render("forgot-password", {
      error: "Email and new password are required.",
      success: null,
      session: req.session,
      cart: req.session.cart || [],
    });
  }

  try {
    const db = await dbPromise;

    const existingUser = await db.get("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (!existingUser) {
      return res.render("forgot-password", {
        error: "No user found with that email address.",
        success: null,
        session: req.session,
        cart: req.session.cart || [],
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.run("UPDATE users SET password = ? WHERE email = ?", [
      hashedPassword,
      email,
    ]);

    return res.render("login", {
      success:
        "Password reset successful! You can now login with your new password.",
      error: null,
      session: req.session,
      cart: req.session.cart || [],
    });
  } catch (error) {
    console.error("Error resetting password:", error);

    res.render("forgot-password", {
      error: "Server error. Please try again later.",
      success: null,
      session: req.session,
      cart: req.session.cart || [],
    });
  }
});

// ==================== EDIT SHIPPING ADDRESS ROUTES ==================== //

// GET: Edit Shipping Address form
router.get(
  "/my-account/edit-address",
  ensureAuthenticated,
  async (req, res) => {
    try {
      const decodedUser = jwt.decode(req.session.token);
      const userId = decodedUser.id;

      const db = await dbPromise;

      const userDetails = await db.get(
        "SELECT name, email FROM users WHERE id = ?",
        userId
      );

      const shippingAddress = await db.get(
        "SELECT * FROM shipping_addresses WHERE user_id = ?",
        userId
      );

      console.log("🚀 shippingAddress going to EJS:", shippingAddress || {});

      res.render("edit-address", {
        user: userDetails,
        shippingAddress: shippingAddress || {},
        session: req.session,
        cart: req.session.cart || [],
      });
    } catch (error) {
      console.error("❌ Error loading edit address page:", error);
      res.redirect("/my-account");
    }
  }
);

// ==================== SAVE SHIPPING ADDRESS ROUTE ==================== //

// POST: Save Shipping Address form
router.post(
  "/my-account/edit-address",
  ensureAuthenticated,
  async (req, res) => {
    try {
      const decodedUser = jwt.decode(req.session.token);
      const userId = decodedUser.id;

      const {
        full_name,
        street,
        address_line2 = null,
        city,
        postcode,
        country,
        phone = null,
        email,
      } = req.body;

      const db = await dbPromise;

      const existingAddress = await db.get(
        "SELECT * FROM shipping_addresses WHERE user_id = ?",
        userId
      );

      if (existingAddress) {
        await db.run(
          `
        UPDATE shipping_addresses
        SET full_name = ?, street = ?, address_line2 = ?, city = ?, postcode = ?, country = ?, phone = ?, email = ?
        WHERE user_id = ?
        `,
          [
            full_name,
            street,
            address_line2,
            city,
            postcode,
            country,
            phone,
            email,
            userId,
          ]
        );
        console.log(`✅ Updated shipping address for user ${userId}`);
      } else {
        await db.run(
          `
        INSERT INTO shipping_addresses 
        (user_id, full_name, street, address_line2, city, postcode, country, phone, email)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
          [
            userId,
            full_name,
            street,
            address_line2,
            city,
            postcode,
            country,
            phone,
            email,
          ]
        );
        console.log(`✅ Created new shipping address for user ${userId}`);
      }

      res.redirect("/my-account");
    } catch (error) {
      console.error("❌ Error saving shipping address:", error);
      res.render("edit-address", {
        error: "There was an issue saving your address. Please try again.",
        session: req.session,
        cart: req.session.cart || [],
      });
    }
  }
);

// ==================== DELETE ORDER ROUTE ==================== //

// POST: Delete an order by ID
router.post(
  "/my-account/orders/:id/delete",
  ensureAuthenticated,
  async (req, res) => {
    try {
      const decodedUser = jwt.decode(req.session.token);
      const userId = decodedUser.id;
      const orderId = req.params.id;

      const db = await dbPromise;

      const order = await db.get(
        "SELECT * FROM orders WHERE id = ? AND user_id = ?",
        [orderId, userId]
      );

      if (!order) {
        console.log("❌ Order not found or unauthorized delete attempt.");
        return res.redirect("/my-account");
      }

      await db.run("DELETE FROM orders WHERE id = ? AND user_id = ?", [
        orderId,
        userId,
      ]);

      console.log(
        `✅ Successfully deleted order ${orderId} for user ${userId}`
      );
      res.redirect("/my-account");
    } catch (error) {
      console.error("❌ Error deleting order:", error);
      res.render("my-account", {
        error: "There was an error deleting the order. Please try again.",
        session: req.session,
        cart: req.session.cart || [],
      });
    }
  }
);

export default router;
