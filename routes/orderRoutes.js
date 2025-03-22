import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import { getUserOrders } from "../controllers/orderController.js";
import dbPromise from "../database/db.js"; // ✅ add this if it's not already imported

const router = express.Router();

// Existing GET /api/orders
router.get("/", verifyToken, (req, res) => {
  console.log("✅ /api/orders route hit");
  getUserOrders(req, res);
});

// ✅ New PATCH route for updating order status
router.patch("/:id/status", verifyToken, async (req, res) => {
  const db = await dbPromise;
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ["Processing", "Completed"];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status value." });
  }

  try {
    const result = await db.run(`UPDATE orders SET status = ? WHERE id = ?`, [
      status,
      id,
    ]);

    if (result.changes === 0) {
      return res.status(404).json({ error: "Order not found." });
    }

    res.json({ message: `Order ${id} updated to "${status}".` });
  } catch (error) {
    console.error("❌ Error updating order status:", error);
    res.status(500).json({ error: "Failed to update order status." });
  }
});

export default router;
