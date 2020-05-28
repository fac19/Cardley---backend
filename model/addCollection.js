const db = require('../db/connection.js');

function addCollection({ userId, deckId, ordering = [] }) {
	return db
		.query(
			`
			INSERT INTO
				collections(user_id, deck_id, ordering)
			VALUES($1, $2, $3)
			RETURNING ordering
			`,
			[userId, deckId, JSON.stringify(ordering)],
		)
		.then(({ rows }) => {
			return rows[0].ordering;
		});
}

module.exports = addCollection;
