const pg = require('pg');
require('dotenv').config();

// Set the default database to be the test database if the TESTING
// environment variable is set to TRUE
if (process.env.TESTING === 'TRUE') {
	process.env.PGDATABASE = process.env.TESTDATABASE;
}

const db = new pg.Pool({
	// Pool is initialised with the environment variables PGDATABASE,
	// PGUSER and PGPASSWORD by default. If process.env.DATABASE_URL
	// exists in the environment (as it does on Heroku for example)
	// that value will override the above variables
	connectionString: process.env.DATABASE_URL,
});

module.exports = db;
