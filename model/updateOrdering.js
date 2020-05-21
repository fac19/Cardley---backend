const db = require('../db/connection.js');

function updateOrdering({ userID, deckID, newOrdering }) {
	return db.query(
		`
		UPDATE collections
		SET ordering = $1
		WHERE user_id = $2 AND deck_id = $3
		`,
		[newOrdering, userID, deckID],
	);
}

module.exports = updateOrdering;
