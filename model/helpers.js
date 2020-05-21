const db = require('../db/connection.js');

function getDeckIdByName(deckName) {
	return db
		.query(`SELECT * FROM decks WHERE deck_name = $1`, [deckName])
		.then((result) => result.rows[0].deck_id);
}

function getUserIdByName(userName) {
	return db
		.query(`SELECT * FROM users WHERE user_name = $1`, [userName])
		.then((result) => result.rows[0].user_id);
}

module.exports = { getDeckIdByName, getUserIdByName };
