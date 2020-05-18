const db = require('../db/connection.js');

function signup({ name, email, password }) {
	return db
		.query(
			'INSERT INTO users(user_name, email, password) VALUES ($1, $2, $3) RETURNING id',
			[name, email, password],
		)
		.then((result) => result.rows[0].id);
}

export default signup;
