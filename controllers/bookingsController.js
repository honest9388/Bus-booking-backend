import db from "../config/db.js";

// ✅ Create a booking
export const createBooking = async (req, res) => {
  try {
    const { user_id, trip_id, seats, passengers } = req.body;

    if (!trip_id || !seats || seats.length === 0) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 1️⃣ Get trip details to check availability & price
    const [tripRows] = await db.query(
      `SELECT available_seats, price FROM trips WHERE id = ?`,
      [trip_id]
    );

    if (tripRows.length === 0) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const trip = tripRows[0];
    if (trip.available_seats < seats.length) {
      return res.status(400).json({ message: "Not enough available seats" });
    }

    const seatString = seats.join(",");
    const total_price = trip.price * seats.length;

    // 2️⃣ Insert booking
    const [bookingResult] = await db.query(
      `INSERT INTO bookings (user_id, trip_id, seats, total_price)
       VALUES (?, ?, ?, ?)`,
      [user_id || null, trip_id, seatString, total_price]
    );

    const bookingId = bookingResult.insertId;

    // 3️⃣ Insert passengers (if provided)
    if (passengers && passengers.length > 0) {
      const passengerValues = passengers.map((p) => [
        bookingId,
        p.name || p.passenger_name,
        p.passenger_id || null,
        p.phone || null,
      ]);

      await db.query(
        `INSERT INTO booking_passengers 
         (booking_id, passenger_name, passenger_id, passenger_phone)
         VALUES ?`,
        [passengerValues]
      );
    }

    // 4️⃣ Update available seats
    await db.query(
      `UPDATE trips SET available_seats = available_seats - ? WHERE id = ?`,
      [seats.length, trip_id]
    );

    res.status(201).json({
      message: "Booking created successfully",
      booking_id: bookingId,
      total_price,
    });
  } catch (err) {
    console.error("❌ Error creating booking:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// ✅ Get booking by ID (with passengers + trip details)
export const getBookingById = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const [rows] = await db.query(
      `SELECT 
        b.id AS booking_id, b.user_id, b.trip_id, b.seats, b.total_price, b.created_at,
        t.price AS seat_price, t.date, t.departure_time, 
        r.origin, r.destination, c.name AS company
       FROM bookings b
       JOIN trips t ON b.trip_id = t.id
       JOIN routes r ON t.route_id = r.id
       JOIN companies c ON t.company_id = c.id
       WHERE b.id = ?`,
      [bookingId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const booking = rows[0];

    // Get passengers
    const [passengers] = await db.query(
      `SELECT passenger_name, passenger_id, passenger_phone
       FROM booking_passengers
       WHERE booking_id = ?`,
      [bookingId]
    );

    booking.passengers = passengers;

    res.json(booking);
  } catch (err) {
    console.error("❌ Error fetching booking:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// ✅ Get all bookings for a user
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.params.userId;
    const [rows] = await db.query(
      `SELECT 
        b.id AS booking_id, b.trip_id, b.seats, b.total_price, b.created_at,
        r.origin, r.destination, c.name AS company
       FROM bookings b
       JOIN trips t ON b.trip_id = t.id
       JOIN routes r ON t.route_id = r.id
       JOIN companies c ON t.company_id = c.id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC`,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching user bookings:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};
