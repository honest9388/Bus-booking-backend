// routes/admin/transactions.js
import express from 'express';
import db from '../../config/db.js';
import { verifyToken, verifyAdmin } from '../../middlewares/auth.js';

const router = express.Router();

router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const companyId = req.admin.company_id;
    const [rows] = await db.query('SELECT * FROM transactions WHERE company_id = ? ORDER BY created_at DESC', [companyId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
