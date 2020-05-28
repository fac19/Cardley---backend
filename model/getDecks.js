const db = require('../db/connection.js');

// THIS ONLY GETS THE DECKS A USER OWNS
// NOT THE ONES THEY HAVE AN ORDERING FOR IN COLLECTIONS!
// function getDecks({ user_id: userId }) {
// 	return db
// 		.query(
// 			`
// 			SELECT
// 				users.user_name,
// 				decks.deck_name,
// 				decks.deck_id
// 			FROM
// 				users
// 			INNER JOIN
// 				decks
// 			ON
// 				users.user_id = decks.owner_id
// 			WHERE
// 				decks.owner_id = $1
// 			ORDER BY decks.deck_name ASC;
// 			`,
// 			[userId],
// 		)
// 		.then((result) => result.rows);
// }

function getDecks({ user_id: userId }) {
	return db
		.query(
			`
			SELECT DISTINCT
				users.user_name,
				decks.deck_name,
				decks.deck_id
			FROM
				collections
			INNER JOIN
				decks
			ON
				collections.deck_id = decks.deck_id
			INNER JOIN
				users
			ON
				decks.owner_id = users.user_id
			WHERE
				collections.user_id = $1
			ORDER BY decks.deck_name ASC;
			`,
			[userId],
		)
		.then((result) => result.rows);
}

module.exports = getDecks;
