const db = require('../db/connection.js');

function getCollectionsByDeck(deckId) {
	return db
		.query(`SELECT * FROM collections WHERE deck_id=($1)`, [deckId])
		.then((result) => result.rows);
}

module.exports = getCollectionsByDeck;
