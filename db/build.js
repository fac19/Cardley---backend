/* eslint no-console: 0 */
const fs = require('fs');
const path = require('path');
const db = require('./connection');
require('dotenv').config();

// Read the database schema from schema.sql
const initPath = path.join(__dirname, 'schema.sql');
let initSql = fs.readFileSync(initPath, 'utf-8');

// If we are in testing mode also load the text fixtures
// stored in test.sql
if (process.env.TESTING === 'TRUE') {
	const fixtPath = path.join(__dirname, 'test.sql');
	const fixtSql = fs.readFileSync(fixtPath, 'utf-8');
	initSql = `${initSql}\n${fixtSql}`;
}

// A common failure mode is that the local user hasn't setup their
// database properly, or hasn't created / properly configured a .env
// file in their project's root folder. This aims to provide a more
// helpful error message than postgres does in that case.
function errorHandler(err) {
	if (err.message.includes('password authentication failed')) {
		console.log("Can't connect to the database");
		console.log('Have you created your databases and/or .env?\n');
		console.log('.env requires the following fields...');
		console.log('PGDATABASE=<your local production database>');
		console.log('TESTDATABASE=<your local testing database>');
		console.log('PGUSER=<a user with full permissions to both the above>');
		console.log('PGPASSWORD=<a password for that user>');
		console.log('SECRET=<the secret code for signing stuff>');
		console.log(err);
	} else {
		console.log('Database error in build.js:\n', err);
	}
}

// Returns a promise where database has been initialized
function build() {
	return db.query(initSql).catch(errorHandler);
}

// Allows build to be ran on the command line, npm run setupdb will now run build()
// require.main === module checks if it is running on the terminal run the build()
if (require.main === module) build();

// In our tests we import then run build().then( our test code here )
module.exports = build;
