import db from '../config/db.js';

// Get all trips or filter by origin, destination, and date
export const getTrips = async (req, res) => {
  try {
    const { origin, destination, date } = req.query;

    let query = `
      SELECT t.id, c.name AS company, r.origin, r.destination,
             t.price, t.date, t.departure_time, t.available_seats
      FROM trips t
      JOIN companies c ON t.company_id = c.id
      JOIN routes r ON t.route_id = r.id
    `;

    const params = [];
    const conditions = [];

    // Case-insensitive filter for origin and destination
    if (origin && destination) {
      conditions.push(`LOWER(r.origin) = LOWER(?) AND LOWER(r.destination) = LOWER(?)`);
      params.push(origin, destination);
    }

    // Filter by date only (ignoring time)
    if (date) {
      conditions.push(`DATE(t.date) = ?`);
      params.push(date);
    }

    // Apply conditions if any
    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('❌ Error fetching trips:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get a single trip by ID
export const getTripById = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT t.id, c.name AS company, r.origin, r.destination,
              t.price, t.date, t.departure_time, t.available_seats
       FROM trips t
       JOIN companies c ON t.company_id = c.id
       JOIN routes r ON t.route_id = r.id
       WHERE t.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) return res.status(404).json({ message: 'Trip not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('❌ Error fetching trip by ID:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};
