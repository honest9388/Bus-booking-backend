import db from '../config/db.js';

export const getAllRoutes = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, origin, destination FROM routes ORDER BY origin, destination'
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createRoute = async (req, res) => {
  try {
    const { origin, destination } = req.body;
    if (!origin || !destination)
      return res
        .status(400)
        .json({ message: 'origin and destination are required' });

    const [result] = await db.query(
      'INSERT INTO routes (origin, destination) VALUES (?, ?)',
      [origin, destination]
    );

    res.status(201).json({ id: result.insertId, origin, destination });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const { origin, destination } = req.body;

    const [result] = await db.query(
      'UPDATE routes SET origin = COALESCE(?, origin), destination = COALESCE(?, destination) WHERE id = ?',
      [origin, destination, id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Route not found' });

    res.json({ message: 'Route updated' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const deleteRoute = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query('DELETE FROM routes WHERE id = ?', [id]);

    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Route not found' });

    res.json({ message: 'Route deleted' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server Error' });
  }
};
