const db = require('../db/connection.js');

function addDeck({ ownerId, deckName, published = false }) {
	return db
		.query(
			`INSERT INTO
			decks(owner_id, deck_name, published)
		VALUES($1, $2, $3)
		returning deck_id;`,
			[ownerId, deckName, published],
		)
		.then((result) => result.rows[0]);
}

module.exports = addDeck;
