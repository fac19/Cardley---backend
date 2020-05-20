const db = require('../db/connection.js');

function getUser({ email }) {
	return db
		.query(`SELECT * FROM users WHERE email = $1`, [email])
		.then((result) => result.rows[0]);
}

module.exports = getUser;
