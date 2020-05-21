const db = require('../db/connection.js');

function getOrdering({ deckId, userId }) {
	return db
		.query(
			`
			SELECT
				ordering
			FROM
			    collections
			WHERE
				deck_id = $1
			AND
				user_id = $2;
			`,
			[deckId, userId],
		)
		.then((result) => {
			if (result.rows.length) {
				return result.rows[0].ordering;
			}
			return false; // rather than undefined
		});
}

module.exports = getOrdering;
