// populateTrips.js
import db from './config/db.js';

async function populateTrips() {
  try {
    // STEP 1: Get all companies and routes
    const [companies] = await db.query('SELECT id FROM companies');
    const [routes] = await db.query('SELECT id FROM routes');

    if (companies.length === 0 || routes.length === 0) {
      console.log('⚠️ No companies or routes found. Please insert those first.');
      process.exit(1);
    }

    // STEP 2: Generate dates for this month
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth(); // 0-based
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const dates = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      dates.push(d.toISOString().split('T')[0]);
    }

    console.log(`📅 Generating trips for ${dates.length} days in ${year}-${month + 1}`);

    // STEP 3: Populate trips for each company & route
    for (const company of companies) {
      for (const route of routes) {
        for (const date of dates) {
          await db.query(
            `INSERT INTO trips (company_id, route_id, price, date, departure_time, arrival_time, available_seats)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              company.id,
              route.id,
              Math.floor(Math.random() * 300) + 300, // price 300-600
              date,
              '06:00', // you can randomize these too
              '12:00',
              50
            ]
          );
        }
      }
    }

    console.log('✅ Trips populated successfully for the entire month!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error populating trips:', err);
    process.exit(1);
  }
}

populateTrips();
