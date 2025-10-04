import express from 'express';
import { addCompany, addTrip } from '../controllers/adminController.js';
const router = express.Router();

router.post('/company', addCompany);
router.post('/trip', addTrip);

export default router;
