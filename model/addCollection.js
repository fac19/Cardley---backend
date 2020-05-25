const db = require('../db/connection.js');

function addCollection({ userId, deckId }) {
	return db.query(
		`
		INSERT INTO
			collections(user_id, deck_id, ordering)
		VALUES($1, $2, $3)
	`,
		[userId, deckId, '[]'],
	);
}

module.exports = addCollection;
