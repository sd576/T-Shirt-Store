import dbPromise from "../database/db.js";

export const getUserOrders = async (req, res) => {
  try {
    const db = await dbPromise;

    const userId = req.user.id; // From verifyToken middleware

    // Query all orders for this user
    const orders = await db.all("SELECT * FROM orders WHERE user_id = ?", [
      userId,
    ]);

    res.status(200).json({
      message: "Orders retrieved successfully",
      orders: orders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to retrieve orders" });
  }
};
