const db = require('../db/connection.js');

function removeCollection({ userId, deckId }) {
	return db
		.query(
			`
			DELETE FROM
				collections
			WHERE
			    user_id = $1
			AND
				deck_id = $2
			`,
			[userId, deckId],
		)
		.then(({ rowCount }) => {
			return rowCount === 1;
		});
}

module.exports = removeCollection;
