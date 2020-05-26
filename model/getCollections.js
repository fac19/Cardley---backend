const db = require('../db/connection.js');

function getCollections(deckId) {
	return db
		.query(`SELECT * FROM collections WHERE deck_id=($1)`, [deckId])
		.then((result) => result.rows);
}

module.exports = getCollections;
