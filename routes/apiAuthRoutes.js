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

export default router;
