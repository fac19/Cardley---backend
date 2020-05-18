const fs = require('fs');
const path = require('path');
const db = require('./connection');
require('dotenv').config();

const initPath = path.join(__dirname, 'schema.sql');
const initSql = fs.readFileSync(initPath, 'utf-8');

function build() {
	return db.query(initSql).catch((err) => {
		if (err.message.includes('password authentication failed')) {
			console.log(
				'Have you created you local test databases and .env file?\n',
				err,
			);
		} else {
			console.log('Database error1\n', err);
		}
	});
}

// Allows build to be ran on the command line, npm run setupdb will now run build()
if (require.main === module) build();

// Testing imports build but chooses when to run it
module.exports = build;
