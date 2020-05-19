const db = require('../db/connection.js');

function createUser({ user_name, email, password: password_slug }) {
	return db
		.query(
			'INSERT INTO users(user_name, email, password_slug) VALUES ($1, $2, $3) RETURNING user_id',
			[user_name, email, password_slug],
		)
		.then((result) => result.rows[0].user_id);
}

module.exports = { createUser };
