import db from '../config/db.js';

export const getCompanies = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, logo, created_at FROM companies ORDER BY name'
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createCompany = async (req, res) => {
  try {
    const { name, logo } = req.body;
    if (!name) return res.status(400).json({ message: 'name is required' });

    const [result] = await db.query(
      'INSERT INTO companies (name, logo) VALUES (?, ?)',
      [name, logo || null]
    );

    res.status(201).json({
      id: result.insertId,
      name,
      logo: logo || null,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, logo } = req.body;

    const [result] = await db.query(
      'UPDATE companies SET name = COALESCE(?, name), logo = COALESCE(?, logo) WHERE id = ?',
      [name, logo, id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Company not found' });

    res.json({ message: 'Company updated' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query('DELETE FROM companies WHERE id = ?', [id]);

    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Company not found' });

    res.json({ message: 'Company deleted' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server Error' });
  }
};
