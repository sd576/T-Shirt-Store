// routes/apiUserRoutes.js
import express from "express";
import dbPromise from "../database/db.js";

const router = express.Router();

router.post("/address", async (req, res) => {
  console.log("🔍 SESSION in /user/address:", req.session);

  try {
    const { street, city, postcode, country, phone } = req.body;
    const db = await dbPromise;

    const user = req.session.user;
    if (!user?.id) return res.status(401).json({ error: "Unauthorized" });

    await db.run(
      `INSERT INTO shipping_addresses 
        (user_id, full_name, street, city, postcode, country, phone, email)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.id,
        user.name,
        street,
        city,
        postcode,
        country,
        phone,
        user.email,
      ]
    );

    res.status(200).json({ message: "Address saved to shipping_addresses" });
  } catch (err) {
    console.error("❌ Error in /api/user/address:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
