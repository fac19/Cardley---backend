const db = require('../db/connection.js');

function getDecks({ user_id: userId }) {
	return db
		.query(
			`
			SELECT
				users.user_name,
				decks.deck_name,
				decks.deck_id
			FROM
				users
			INNER JOIN
				decks
			ON
				users.user_id = decks.owner_id
			WHERE
				decks.owner_id = $1
			ORDER BY decks.deck_name ASC;
			`,
			[userId],
		)
		.then((result) => result.rows);
}

module.exports = getDecks;
