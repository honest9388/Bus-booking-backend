// routes/admin/trips.js
import express from 'express';
import db from '../../config/db.js';
import { verifyToken, verifyAdmin } from '../../middlewares/auth.js';

const router = express.Router();

// GET all trips for the admin's company
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const companyId = req.admin.company_id;
    const [rows] = await db.query(
      `SELECT t.*, r.origin, r.destination
       FROM trips t
       LEFT JOIN routes r ON t.route_id = r.id
       WHERE t.company_id = ?`,
      [companyId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST create trip
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const companyId = req.admin.company_id;
    const { route_id, date, departure_time, price, total_seats } = req.body;

    const [result] = await db.query(
      `INSERT INTO trips (company_id, route_id, date, departure_time, price, total_seats, available_seats)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [companyId, route_id, date, departure_time, price, total_seats, total_seats]
    );

    res.json({ message: 'Trip created', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT edit trip
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const tripId = req.params.id;
    const companyId = req.admin.company_id;
    const { route_id, date, departure_time, price, total_seats } = req.body;

    await db.query(
      `UPDATE trips 
       SET route_id=?, date=?, departure_time=?, price=?, total_seats=? 
       WHERE id=? AND company_id=?`,
      [route_id, date, departure_time, price, total_seats, tripId, companyId]
    );

    res.json({ message: 'Trip updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE trip
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const tripId = req.params.id;
    const companyId = req.admin.company_id;

    await db.query('DELETE FROM trips WHERE id=? AND company_id=?', [tripId, companyId]);

    res.json({ message: 'Trip deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
