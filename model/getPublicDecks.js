const db = require('../db/connection.js');

function getPublicDecks() {
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
			ORDER BY decks.deck_name ASC;
			`,
		)
		.then((result) => result.rows);
}

module.exports = getPublicDecks;
