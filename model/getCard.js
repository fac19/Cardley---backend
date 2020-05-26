/* eslint-disable no-else-return */
const db = require('../db/connection.js');

// TODO We have permission checking happen elsewhere nows
// So refactor to use a single integer as it's parameter
// and get rid of the if/else.
function getCard({ cardId, enforceOwner = false }) {
	if (!enforceOwner) {
		return db
			.query(`SELECT * FROM cards WHERE card_id = $1`, [cardId])
			.then((result) => result.rows[0]);
	} else {
		// TODO Not tested enforcement yet, first doesn't need it
		// But GET /cards/:card_id will.
		return db
			.query(
				`SELECT
					*
				FROM
					cards
				INNER JOIN
				    decks
				ON
				    cards.deck_id = decks.deck_id
				WHERE
					cards.card_id = $1
				AND
					decks.owner_id = $2;
			   `,
				[cardId, enforceOwner],
			)
			.then((result) => result.rows[0]);
	}
}

module.exports = getCard;
