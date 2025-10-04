import express from 'express';
import {
  getCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
} from '../controllers/companiesController.js';

const router = express.Router();

router.get('/', getCompanies);        // GET all companies
router.post('/', createCompany);      // POST create company
router.put('/:id', updateCompany);    // PUT update company by ID
router.delete('/:id', deleteCompany); // DELETE company by ID

export default router;
