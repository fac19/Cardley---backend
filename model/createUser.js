const db = require('../db/connection.js');

function createUser({ userName, email, password }) {
	return db
		.query(
			`INSERT INTO
			 	users(user_name, email, password_slug)
			VALUES
				($1, $2, $3)
			RETURNING user_id`,
			[userName, email, password],
		)
		.then((result) => result.rows[0].user_id);
}

module.exports = createUser;
