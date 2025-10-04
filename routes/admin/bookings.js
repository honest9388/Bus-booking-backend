// routes/admin/bookings.js
import express from 'express';
import db from '../../config/db.js';
import { verifyToken, verifyAdmin } from '../../middlewares/auth.js';

const router = express.Router();

// GET bookings for admin's company (with trip and passenger details)
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const companyId = req.admin.company_id;

    const [rows] = await db.query(
      `SELECT b.*, t.company_id, t.route_id, r.origin, r.destination, t.departure_time
       FROM bookings b
       JOIN trips t ON b.trip_id = t.id
       JOIN routes r ON t.route_id = r.id
       WHERE t.company_id = ?
       ORDER BY b.created_at DESC`,
      [companyId]
    );

    // attach passengers per booking
    for (let booking of rows) {
      const [pass] = await db.query(
        'SELECT passenger_name, passenger_id, passenger_phone FROM booking_passengers WHERE booking_id = ?',
        [booking.id]
      );
      booking.passengers = pass;
    }

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
