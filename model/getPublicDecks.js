const db = require('../db/connection.js');

function getPublicDecks(except = -1) {
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
				decks.published = true
			AND
				users.user_id != ($1)
			ORDER BY decks.deck_name ASC;
			`,
			[except],
		)
		.then((result) => result.rows);
}

module.exports = getPublicDecks;
