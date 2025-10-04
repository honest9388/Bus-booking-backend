// C:/laragon/www/bus-booking-backend/routes/admin/auth.js
import express from "express";
import jwt from "jsonwebtoken";
import db from "../../config/db.js";

const router = express.Router();

// Admin login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if admin exists
    const [rows] = await db.query(
      "SELECT * FROM admins WHERE email = ? AND password = ?",
      [email, password] // ⚠️ plaintext for demo, use bcrypt in production!
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const admin = rows[0];

    // Generate JWT
    const token = jwt.sign(
      {
        id: admin.id,
        role: "admin",
        company_id: admin.company_id,
      },
      process.env.JWT_SECRET || "supersecretkey",
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      admin: { id: admin.id, email: admin.email, company_id: admin.company_id },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
