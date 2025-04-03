import express from "express";
import {
  apiLoginUser,
  apiRegisterUser,
  apiLogoutUser,
  updateUserAccount,
} from "../controllers/authController.js";

const router = express.Router();

// POST /api/auth/register
router.post("/register", apiRegisterUser);

// POST /api/auth/login
router.post("/login", apiLoginUser);

// GET /api/auth/logout
router.get("/logout", apiLogoutUser);

// PATCH /api/auth/update
router.patch("/users/:id", updateUserAccount);

// DELETE /api/auth/users/:email
router.delete("/users/:email", (req, res) => {
  const email = req.params.email;

  req.app.locals.db.run(
    "DELETE FROM users WHERE email = ?",
    [email],
    function (err) {
      if (err) {
        console.error("❌ Error deleting user:", err);
        return res.status(500).json({ error: "Internal server error" });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: `User ${email} not found.` });
      }

      return res.status(200).json({ message: `User ${email} deleted.` });
    }
  );
});

export default router;
