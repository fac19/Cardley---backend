const db = require('../db/connection.js');
const { errNow } = require('../utils.js');

function updateOrdering(userId, deckId, newOrdering) {
	// console.log({ userId, deckId, newOrdering });
	// console.log("UPDATE ORDERING RECEIVED", userId, deckId, newOrdering );
	return db
		.query(
			`
		UPDATE collections
		SET ordering = $1
		WHERE user_id = $2 AND deck_id = $3
		RETURNING *`,
			[newOrdering, userId, deckId],
		)
		.then((result) => {
			// console.log(
			// 	`NewOrdering for u:${userId} d:${deckId} , ${newOrdering}`,
			// );
			// console.log("updateOrdering result", result.rows)
			if (result.rows.length !== 1) {
				throw errNow(
					500,
					`Problem updating deck ordering`,
					'models/updateOrdering result.rows !== 1',
				);
			}
			return true;
		});
}

module.exports = updateOrdering;
