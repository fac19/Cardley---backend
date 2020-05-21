const db = require('../db/connection.js');

function updateOrdering({ userId, deckId, newOrdering }) {
	console.log('model.updateOrdering to be:', newOrdering);
	return db.query(
		`
		UPDATE collections
		SET ordering = $1
		WHERE user_id = $2 AND deck_id = $3
		`,
		[newOrdering, userId, deckId],
	);
}

module.exports = updateOrdering;
