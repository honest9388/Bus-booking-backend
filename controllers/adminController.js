import db from '../config/db.js';

// Add a company
export const addCompany = async (req, res) => {
  try {
    const { name } = req.body;
    await db.query('INSERT INTO companies (name) VALUES (?)', [name]);
    res.json({ message: 'Company added' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add a trip
export const addTrip = async (req, res) => {
  try {
    const { company_id, origin, destination, price, departure_time } = req.body;
    await db.query(
      'INSERT INTO trips (company_id, origin, destination, price, departure_time) VALUES (?, ?, ?, ?, ?)',
      [company_id, origin, destination, price, departure_time]
    );
    res.json({ message: 'Trip added' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
