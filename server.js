// server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

// Public routes
import tripsRoutes from './routes/trips.js';
import bookingsRoutes from './routes/bookings.js';
import companiesRoutes from './routes/companies.js';
import routesRoutes from './routes/routes.js';

// Admin routes
import adminAuthRoutes from './routes/admin/auth.js';
import adminTripsRoutes from './routes/admin/trips.js';
import adminBookingsRoutes from './routes/admin/bookings.js';
import adminTransactionsRoutes from './routes/admin/transactions.js';

// Load environment variables
dotenv.config();

const app = express();  // ✅ create app first

// Middleware
app.use(cors());
app.use(express.json());

// Public API Routes
app.use('/api/trips', tripsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/routes', routesRoutes);

// Admin API Routes
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/trips', adminTripsRoutes);
app.use('/api/admin/bookings', adminBookingsRoutes);
app.use('/api/admin/transactions', adminTransactionsRoutes);

// Default Route (Optional)
app.get('/', (req, res) => {
  res.json({ message: '🚍 Bus Booking API is running!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
