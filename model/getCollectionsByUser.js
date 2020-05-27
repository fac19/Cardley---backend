const db = require('../db/connection.js');

function getCollectionsByUser(userId) {
	return db
		.query(`SELECT * FROM collections WHERE user_id=($1)`, [userId])
		.then((result) => result.rows);
}

module.exports = getCollectionsByUser;
