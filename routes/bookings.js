// routes/bookings.js
import express from 'express';
import db from '../config/db.js';

const router = express.Router();

// Create a new booking
router.post('/', async (req, res) => {
  try {
    const { user_id, trip_id, seats, passengers } = req.body;

    if (!user_id || !trip_id || !seats || seats.length === 0) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Get trip details
    const [tripRows] = await db.query(
      'SELECT id, company_id, route_id, price, available_seats, departure_time FROM trips WHERE id = ?',
      [trip_id]
    );

    if (tripRows.length === 0) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const trip = tripRows[0];

    if (trip.available_seats < seats.length) {
      return res.status(400).json({ message: 'Not enough available seats' });
    }

    const seatString = seats.join(',');
    const total_price = trip.price * seats.length;

    // Insert booking
    const [bookingResult] = await db.query(
      'INSERT INTO bookings (user_id, trip_id, seats, total_price) VALUES (?, ?, ?, ?)',
      [user_id, trip_id, seatString, total_price]
    );

    const booking_id = bookingResult.insertId;

    // Insert passengers
    if (passengers && passengers.length > 0) {
      const passengerValues = passengers.map(p => [
        booking_id,
        p.name || p.passenger_name,
        p.passenger_id || null,
        p.phone || p.passenger_phone || null
      ]);

      await db.query(
        'INSERT INTO booking_passengers (booking_id, passenger_name, passenger_id, passenger_phone) VALUES ?',
        [passengerValues]
      );
    }

    // Update available seats
    await db.query(
      'UPDATE trips SET available_seats = available_seats - ? WHERE id = ?',
      [seats.length, trip_id]
    );

    res.json({ message: 'Booking successful', booking_id, total_price });
  } catch (err) {
    console.error('Booking Error:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Get booking by ID including trip info and passengers
router.get('/:id', async (req, res) => {
  try {
    const bookingId = req.params.id;

    // Fetch booking with trip, company, and route info
    const [rows] = await db.query(
      `SELECT b.id AS booking_id, b.user_id, b.trip_id, b.seats, b.total_price, b.created_at,
              t.departure_time, t.price AS seat_price,
              c.name AS company,
              r.origin, r.destination
       FROM bookings b
       JOIN trips t ON b.trip_id = t.id
       JOIN companies c ON t.company_id = c.id
       JOIN routes r ON t.route_id = r.id
       WHERE b.id = ?`,
      [bookingId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const booking = rows[0];

    // Fetch passengers
    const [passengerRows] = await db.query(
      'SELECT passenger_name, passenger_id, passenger_phone FROM booking_passengers WHERE booking_id = ?',
      [bookingId]
    );

    booking.passengers = passengerRows;

    res.json(booking);
  } catch (err) {
    console.error('Get Booking Error:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

export default router;
